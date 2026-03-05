import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-secondary/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 font-heading font-bold text-lg mb-4">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Rufus Sam
            </Link>
            <p className="text-sm text-muted-foreground">
              Your one-stop shop for quality products at great prices.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3">Shop</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/products" className="hover:text-foreground transition-colors">All Products</Link>
              <Link to="/products?category=new" className="hover:text-foreground transition-colors">New Arrivals</Link>
              <Link to="/products?category=sale" className="hover:text-foreground transition-colors">Sale</Link>
            </nav>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3">Account</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/profile" className="hover:text-foreground transition-colors">My Profile</Link>
              <Link to="/orders" className="hover:text-foreground transition-colors">Order History</Link>
              <Link to="/cart" className="hover:text-foreground transition-colors">Shopping Cart</Link>
            </nav>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3">Support</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span className="cursor-default">Contact Us</span>
              <span className="cursor-default">Shipping Info</span>
              <span className="cursor-default">Returns</span>
            </nav>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Rufus Sam. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
