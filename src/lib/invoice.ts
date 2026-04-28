import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatPrice } from "./currency";

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  full_name?: string;
  phone?: string;
  street_address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  gstin?: string;
  email?: string;
}

interface OrderData {
  id: string;
  created_at: string;
  status: string;
  payment_status: string;
  total: number;
  shipping_address: ShippingAddress | any;
  order_items: OrderItem[];
  tracking_number?: string | null;
  notes?: string | null;
}

// Company / Seller details
const COMPANY = {
  name: "DYNAMIC UNIVERSAL MARKETING",
  address: "NO .13, Ground floor, Subbaraju Layout, Near Gokula Nandana Residency, doddakallasandra, Kanakapura Main Road, Bengaluru, Karnataka, 560062",
  mobile: "8884052640",
  email: "marketingdynamic81@gmail.com",
  gstin: "29AKFPU1710L1ZV",
  pan: "AKFPU1710L",
  state: "Karnataka",
};

const BANK = {
  name: "DYNAMIC UNIVERSAL MARKETING",
  ifsc: "UTIB0005011",
  account: "923020037868455",
  bank: "Axis Bank, KONANAKUNTE",
  upi: "8884052641@axisbank",
};

const GST_RATE = 0.18; // 18% GST (CGST 9% + SGST 9%) — prices treated as inclusive

function formatStatus(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function rupees(n: number): string {
  // Plain number with INR formatting (no symbol issues in jsPDF default font)
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function numberToWords(num: number): string {
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const inWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + inWords(n % 100) : "");
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
    return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
  };
  const rounded = Math.round(num);
  return (inWords(rounded) || "Zero") + " Rupees Only";
}

export function generateInvoicePDF(order: OrderData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const contentW = pageWidth - margin * 2;

  const addr = order.shipping_address as ShippingAddress;
  const customerName = addr?.full_name || "Customer";
  const phone = addr?.phone || "";
  const email = addr?.email || "";
  const gstin = addr?.gstin || "";
  const buyerState = addr?.state || "";
  const addressLine = [addr?.street_address, addr?.city, addr?.state, addr?.postal_code, addr?.country]
    .filter(Boolean)
    .join(", ");

  const invoiceNo = order.id.slice(0, 8).toUpperCase();
  const invoiceDate = new Date(order.created_at).toLocaleDateString("en-GB");
  const dueDate = new Date(new Date(order.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB");

  let y = margin;

  // ============ TOP BAR: TAX INVOICE / Customer name ============
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text("TAX INVOICE", margin, y + 4);

  // "ORIGINAL FOR RECIPIENT" pill
  doc.setDrawColor(180, 180, 180);
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin + 22, y, 50, 6, 1, 1, "FD");
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("ORIGINAL FOR RECIPIENT", margin + 47, y + 4, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.text(customerName, pageWidth - margin, y + 4, { align: "right" });

  y += 10;

  // ============ HEADER: Logo placeholder + Company details ============
  // Logo box (left)
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, 30, 24);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(120, 120, 120);
  doc.text("LOGO", margin + 15, y + 13, { align: "center" });

  // Company details (right of logo)
  const compX = margin + 34;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(204, 0, 0);
  doc.text(COMPANY.name, compX, y + 5);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  const addrLines = doc.splitTextToSize(COMPANY.address, contentW - 36);
  doc.text(addrLines, compX, y + 10);

  let cy = y + 10 + addrLines.length * 4;
  doc.setFont("helvetica", "bold");
  doc.text("Mobile:", compX, cy);
  doc.setFont("helvetica", "normal");
  doc.text(COMPANY.mobile, compX + 14, cy);

  doc.setFont("helvetica", "bold");
  doc.text("GSTIN:", compX + 45, cy);
  doc.setFont("helvetica", "normal");
  doc.text(COMPANY.gstin, compX + 58, cy);

  doc.setFont("helvetica", "bold");
  doc.text("PAN Number:", compX + 100, cy);
  doc.setFont("helvetica", "normal");
  doc.text(COMPANY.pan, compX + 122, cy);

  cy += 4;
  doc.setFont("helvetica", "bold");
  doc.text("Email:", compX, cy);
  doc.setFont("helvetica", "normal");
  doc.text(COMPANY.email, compX + 14, cy);

  y += 26;

  // Red separator
  doc.setDrawColor(204, 0, 0);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 3;

  // ============ INVOICE INFO BAR ============
  doc.setFillColor(238, 238, 238);
  doc.rect(margin, y, contentW, 8, "F");

  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);
  const colW = contentW / 3;

  doc.setFont("helvetica", "bold");
  doc.text("Invoice No.:", margin + 3, y + 5);
  doc.setFont("helvetica", "normal");
  doc.text(invoiceNo, margin + 25, y + 5);

  doc.setFont("helvetica", "bold");
  doc.text("Invoice Date:", margin + colW + 3, y + 5);
  doc.setFont("helvetica", "normal");
  doc.text(invoiceDate, margin + colW + 27, y + 5);

  doc.setFont("helvetica", "bold");
  doc.text("Due Date:", margin + colW * 2 + 3, y + 5);
  doc.setFont("helvetica", "normal");
  doc.text(dueDate, margin + colW * 2 + 22, y + 5);

  y += 11;

  // ============ BILL TO / SHIP TO ============
  const halfW = contentW / 2;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text("BILL TO", margin, y);
  doc.text("SHIP TO", margin + halfW, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(customerName.toUpperCase(), margin, y);
  doc.text(customerName.toUpperCase(), margin + halfW, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);

  const billLines = doc.splitTextToSize(addressLine, halfW - 4);
  doc.text(billLines, margin, y);
  doc.text(billLines, margin + halfW, y);

  let by = y + billLines.length * 4 + 1;

  if (phone) {
    doc.setFont("helvetica", "bold");
    doc.text("Mobile:", margin, by);
    doc.setFont("helvetica", "normal");
    doc.text(phone, margin + 14, by);
    by += 4;
  }
  if (gstin) {
    doc.setFont("helvetica", "bold");
    doc.text("GSTIN:", margin, by);
    doc.setFont("helvetica", "normal");
    doc.text(gstin, margin + 14, by);
    by += 4;
  }
  if (buyerState) {
    doc.setFont("helvetica", "bold");
    doc.text("Place of Supply:", margin, by);
    doc.setFont("helvetica", "normal");
    doc.text(buyerState, margin + 30, by);
    by += 4;
  }

  y = by + 3;

  // Red separator
  doc.setDrawColor(204, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 3;

  // ============ ITEMS TABLE ============
  // Compute per-item GST (price treated as inclusive of 18%)
  const rows = order.order_items.map((item) => {
    const lineGross = item.price * item.quantity;
    const lineTaxable = lineGross / (1 + GST_RATE);
    const lineTax = lineGross - lineTaxable;
    const unitRate = item.price / (1 + GST_RATE);
    return {
      name: item.product_name,
      hsn: "",
      qty: `${item.quantity} PCS`,
      rate: rupees(unitRate),
      tax: `${rupees(lineTax)}\n(18%)`,
      amount: rupees(lineGross),
      _taxable: lineTaxable,
      _tax: lineTax,
      _amount: lineGross,
    };
  });

  autoTable(doc, {
    startY: y,
    head: [["ITEMS", "HSN", "QTY.", "RATE", "TAX", "AMOUNT"]],
    body: rows.map((r) => [r.name, r.hsn, r.qty, r.rate, r.tax, r.amount]),
    theme: "plain",
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [40, 40, 40],
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: { bottom: 0.4 } as any,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [40, 40, 40],
      lineColor: [220, 220, 220],
      lineWidth: { bottom: 0.2 } as any,
      valign: "middle",
    },
    columnStyles: {
      0: { cellWidth: 65 },
      1: { cellWidth: 22, halign: "left" },
      2: { cellWidth: 20, halign: "left" },
      3: { cellWidth: 22, halign: "right" },
      4: { cellWidth: 28, halign: "right" },
      5: { cellWidth: 33, halign: "right" },
    },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 4;

  // ============ TOTALS ROW BAR ============
  const totalTaxable = rows.reduce((s, r) => s + r._taxable, 0);
  const totalTax = rows.reduce((s, r) => s + r._tax, 0);
  const grandTotal = rows.reduce((s, r) => s + r._amount, 0);
  const cgst = totalTax / 2;
  const sgst = totalTax / 2;

  // Red separator
  doc.setDrawColor(204, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  // SUBTOTAL row
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text("SUBTOTAL", margin, y + 3);
  doc.text("-", margin + 105, y + 3, { align: "right" });
  doc.text(rupees(totalTax), margin + 140, y + 3, { align: "right" });
  doc.text(rupees(grandTotal), pageWidth - margin, y + 3, { align: "right" });

  y += 8;
  doc.setDrawColor(204, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  // ============ BANK DETAILS (left) + TAX SUMMARY (right) ============
  const bankX = margin;
  const sumX = pageWidth - margin;
  const sumLabelX = pageWidth - margin - 50;
  let by2 = y;

  // BANK DETAILS
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text("BANK DETAILS", bankX, by2);
  by2 += 5;

  doc.setFontSize(8);
  const bankRows = [
    ["Name:", BANK.name],
    ["IFSC Code:", BANK.ifsc],
    ["Account No:", BANK.account],
    ["Bank:", BANK.bank],
  ];
  for (const [label, value] of bankRows) {
    doc.setFont("helvetica", "bold");
    doc.text(label, bankX, by2);
    doc.setFont("helvetica", "normal");
    doc.text(value, bankX + 22, by2);
    by2 += 4;
  }

  // TAX SUMMARY (right column)
  let sy = y;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);

  doc.text("Taxable Amount", sumLabelX, sy);
  doc.text(rupees(totalTaxable), sumX, sy, { align: "right" });
  sy += 5;
  doc.text("CGST @9%", sumLabelX, sy);
  doc.text(rupees(cgst), sumX, sy, { align: "right" });
  sy += 5;
  doc.text("SGST @9%", sumLabelX, sy);
  doc.text(rupees(sgst), sumX, sy, { align: "right" });
  sy += 3;

  doc.setDrawColor(180, 180, 180);
  doc.line(sumLabelX - 5, sy, sumX, sy);
  sy += 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text("Total Amount", sumLabelX, sy);
  doc.text(rupees(grandTotal), sumX, sy, { align: "right" });
  sy += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text("Received Amount", sumLabelX, sy);
  const received = order.payment_status === "paid" ? grandTotal : 0;
  doc.text(rupees(received), sumX, sy, { align: "right" });

  y = Math.max(by2, sy) + 6;

  // ============ PAYMENT QR + AMOUNT IN WORDS ============
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text("PAYMENT QR CODE", margin, y);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("UPI ID:", margin, y + 5);
  doc.setFont("helvetica", "normal");
  doc.text(BANK.upi, margin, y + 9);

  // QR placeholder box
  doc.setDrawColor(200, 200, 200);
  doc.rect(margin + 35, y - 2, 22, 22);
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("QR", margin + 46, y + 10, { align: "center" });

  // Amount in words (right)
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text("Total Amount (in words)", sumX, y, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  const words = numberToWords(grandTotal);
  const wordsLines = doc.splitTextToSize(words, 80);
  doc.text(wordsLines, sumX, y + 5, { align: "right" });

  y += 26;

  // ============ AUTHORIZED SIGNATORY ============
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  doc.line(sumX - 50, y, sumX, y);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text("Authorized Signatory", sumX, y + 4, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(`for ${COMPANY.name}`, sumX, y + 8, { align: "right" });

  return doc;
}

export function downloadInvoice(order: OrderData) {
  const doc = generateInvoicePDF(order);
  doc.save(`invoice-${order.id.slice(0, 8)}.pdf`);
}

export function getInvoiceBlob(order: OrderData): Blob {
  const doc = generateInvoicePDF(order);
  return doc.output("blob");
}

export function shareInvoiceViaWhatsApp(order: OrderData) {
  const orderId = order.id.slice(0, 8).toUpperCase();
  const text = encodeURIComponent(
    `Invoice #${orderId}\n` +
    `Amount: ${formatPrice(order.total)}\n` +
    `Status: ${formatStatus(order.status)}\n` +
    `Date: ${new Date(order.created_at).toLocaleDateString("en-IN")}\n\n` +
    `From ${COMPANY.name}`
  );
  window.open(`https://wa.me/?text=${text}`, "_blank");
}

export function shareInvoiceViaEmail(order: OrderData) {
  const orderId = order.id.slice(0, 8).toUpperCase();
  const subject = encodeURIComponent(`Invoice #${orderId} - ${COMPANY.name}`);
  const body = encodeURIComponent(
    `Invoice #${orderId}\n\n` +
    `Amount: ${formatPrice(order.total)}\n` +
    `Status: ${formatStatus(order.status)}\n` +
    `Date: ${new Date(order.created_at).toLocaleDateString("en-IN")}\n\n` +
    `Thank you for shopping with ${COMPANY.name}!`
  );
  window.open(`mailto:?subject=${subject}&body=${body}`, "_self");
}

export function copyInvoiceDetails(order: OrderData): string {
  const orderId = order.id.slice(0, 8).toUpperCase();
  const addr = order.shipping_address as ShippingAddress;
  const items = order.order_items
    .map((item) => `  • ${item.product_name} x${item.quantity} — ${formatPrice(item.price * item.quantity)}`)
    .join("\n");

  return (
    `Invoice #${orderId}\n` +
    `Date: ${new Date(order.created_at).toLocaleDateString("en-IN")}\n` +
    `Customer: ${addr?.full_name || "—"}\n` +
    `Phone: ${addr?.phone || "—"}\n\n` +
    `Items:\n${items}\n\n` +
    `Total: ${formatPrice(order.total)}\n` +
    `Payment: ${formatStatus(order.payment_status)}\n` +
    `Status: ${formatStatus(order.status)}\n\n` +
    `— ${COMPANY.name}`
  );
}
