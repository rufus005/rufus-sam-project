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

const STORE_NAME = "Dynamic Universal Marketing";
const STORE_TAGLINE = "Quality products, delivered with care";

function formatStatus(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function generateInvoicePDF(order: OrderData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const addr = order.shipping_address as ShippingAddress;
  const customerName = addr?.full_name || "Customer";
  const phone = addr?.phone || "";
  const addressLine = [addr?.street_address, addr?.city, addr?.state, addr?.postal_code, addr?.country]
    .filter(Boolean)
    .join(", ");

  let y = 20;

  // ---- Header with store branding ----
  doc.setFillColor(37, 99, 235); // primary blue
  doc.rect(0, 0, pageWidth, 45, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(STORE_NAME, 14, 22);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(STORE_TAGLINE, 14, 30);

  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - 14, 22, { align: "right" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`#${order.id.slice(0, 8).toUpperCase()}`, pageWidth - 14, 30, { align: "right" });
  doc.text(
    new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
    pageWidth - 14,
    37,
    { align: "right" }
  );

  y = 58;
  doc.setTextColor(60, 60, 60);

  // ---- Two-column: Bill To + Order Info ----
  const colLeft = 14;
  const colRight = pageWidth / 2 + 10;

  // Bill To
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(120, 120, 120);
  doc.text("BILL TO", colLeft, y);
  y += 6;
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(customerName, colLeft, y);
  y += 5;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  if (phone) {
    doc.text(phone, colLeft, y);
    y += 4.5;
  }
  // Wrap address
  const addrLines = doc.splitTextToSize(addressLine, pageWidth / 2 - 20);
  doc.text(addrLines, colLeft, y);

  // Order Info (right column)
  let yr = 58;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(120, 120, 120);
  doc.text("ORDER DETAILS", colRight, yr);
  yr += 6;

  const orderInfoRows = [
    ["Order ID:", `#${order.id.slice(0, 8).toUpperCase()}`],
    ["Status:", formatStatus(order.status)],
    ["Payment:", formatStatus(order.payment_status)],
  ];
  if (order.tracking_number) {
    orderInfoRows.push(["Tracking:", order.tracking_number]);
  }

  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  for (const [label, value] of orderInfoRows) {
    doc.setFont("helvetica", "normal");
    doc.text(label, colRight, yr);
    doc.setFont("helvetica", "bold");
    doc.text(value, colRight + 28, yr);
    yr += 5;
  }

  y = Math.max(y + addrLines.length * 4.5, yr) + 10;

  // ---- Items table ----
  const tableBody = order.order_items.map((item, i) => [
    String(i + 1),
    item.product_name,
    String(item.quantity),
    formatPrice(item.price),
    formatPrice(item.price * item.quantity),
  ]);

  autoTable(doc, {
    startY: y,
    head: [["#", "Product", "Qty", "Unit Price", "Amount"]],
    body: tableBody,
    theme: "plain",
    headStyles: {
      fillColor: [245, 245, 250],
      textColor: [80, 80, 80],
      fontStyle: "bold",
      fontSize: 9,
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: [40, 40, 40],
    },
    alternateRowStyles: {
      fillColor: [250, 250, 255],
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 32, halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore - jspdf-autotable adds lastAutoTable
  y = (doc as any).lastAutoTable.finalY + 10;

  // ---- Summary ----
  const subtotal = order.order_items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const summaryX = pageWidth - 14;

  // Divider line
  doc.setDrawColor(220, 220, 230);
  doc.setLineWidth(0.3);
  doc.line(pageWidth / 2, y, pageWidth - 14, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Subtotal:", summaryX - 40, y);
  doc.text(formatPrice(subtotal), summaryX, y, { align: "right" });
  y += 6;
  doc.text("Shipping:", summaryX - 40, y);
  doc.text("Free", summaryX, y, { align: "right" });
  y += 8;

  // Total with background
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(pageWidth / 2, y - 5, pageWidth / 2 - 14, 14, 3, 3, "F");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Total:", pageWidth / 2 + 8, y + 4);
  doc.text(formatPrice(order.total), summaryX - 4, y + 4, { align: "right" });

  y += 24;

  // ---- Footer ----
  doc.setDrawColor(220, 220, 230);
  doc.setLineWidth(0.3);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(140, 140, 140);
  doc.text("Thank you for your purchase!", pageWidth / 2, y, { align: "center" });
  y += 4;
  doc.text(`${STORE_NAME} • Generated on ${new Date().toLocaleDateString("en-IN")}`, pageWidth / 2, y, { align: "center" });

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
    `📄 Invoice #${orderId}\n` +
    `Amount: ${formatPrice(order.total)}\n` +
    `Status: ${formatStatus(order.status)}\n` +
    `Date: ${new Date(order.created_at).toLocaleDateString("en-IN")}\n\n` +
    `From ${STORE_NAME}`
  );
  window.open(`https://wa.me/?text=${text}`, "_blank");
}

export function shareInvoiceViaEmail(order: OrderData) {
  const orderId = order.id.slice(0, 8).toUpperCase();
  const subject = encodeURIComponent(`Invoice #${orderId} - ${STORE_NAME}`);
  const body = encodeURIComponent(
    `Invoice #${orderId}\n\n` +
    `Amount: ${formatPrice(order.total)}\n` +
    `Status: ${formatStatus(order.status)}\n` +
    `Date: ${new Date(order.created_at).toLocaleDateString("en-IN")}\n\n` +
    `Thank you for shopping with ${STORE_NAME}!`
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
    `📄 Invoice #${orderId}\n` +
    `Date: ${new Date(order.created_at).toLocaleDateString("en-IN")}\n` +
    `Customer: ${addr?.full_name || "—"}\n` +
    `Phone: ${addr?.phone || "—"}\n\n` +
    `Items:\n${items}\n\n` +
    `Total: ${formatPrice(order.total)}\n` +
    `Payment: ${formatStatus(order.payment_status)}\n` +
    `Status: ${formatStatus(order.status)}\n\n` +
    `— ${STORE_NAME}`
  );
}
