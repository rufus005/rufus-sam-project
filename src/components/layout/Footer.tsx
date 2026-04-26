import { Link } from "react-router-dom";
import { ShoppingBag, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-heading font-bold text-lg mb-4">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Dynamic Universal Marketing
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Premium shoe storage solutions — durable, high-capacity racks for every home, shop and showroom.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                <span>admin@dynamicuniversalmarketing.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" />
                <span>+91 7899779304</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4 text-sm uppercase tracking-wider">Shop</h4>
            <nav className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <Link to="/products" className="hover:text-foreground transition-colors">All Products</Link>
              <Link to="/products?category=new" className="hover:text-foreground transition-colors">New Arrivals</Link>
              <Link to="/products?category=sale" className="hover:text-foreground transition-colors">Sale</Link>
            </nav>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4 text-sm uppercase tracking-wider">Account</h4>
            <nav className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <Link to="/profile" className="hover:text-foreground transition-colors">My Profile</Link>
              <Link to="/orders" className="hover:text-foreground transition-colors">Order History</Link>
              <Link to="/cart" className="hover:text-foreground transition-colors">Shopping Cart</Link>
            </nav>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-4 text-sm uppercase tracking-wider">Support</h4>
            <nav className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact Us</Link>
              <Link to="/about" className="hover:text-foreground transition-colors">About Us</Link>
              <span className="cursor-default">Shipping Info</span>
              <span className="cursor-default">Returns Policy</span>
            </nav>
          </div>
        </div>
        <div className="border-t mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Dynamic Universal Marketing. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="text-xs">Powered by Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
