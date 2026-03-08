import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, Search, Menu, ShoppingBag, LogOut, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";

const navLinks = [
  { label: "Products", href: "/products" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden shrink-0">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <div className="flex items-center gap-2 font-heading font-bold text-lg mb-8 mt-4">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Rufus Sam
            </div>
            <nav className="flex flex-col gap-1">
              <Link to="/" className="px-3 py-2.5 rounded-lg text-base font-medium hover:bg-secondary transition-colors">Home</Link>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    location.pathname === link.href ? "bg-primary/10 text-primary" : "hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <>
                  <div className="border-t my-2" />
                  <Link to="/profile" className="px-3 py-2.5 rounded-lg text-base font-medium hover:bg-secondary transition-colors">Profile</Link>
                  <Link to="/orders" className="px-3 py-2.5 rounded-lg text-base font-medium hover:bg-secondary transition-colors">Orders</Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-heading font-bold text-xl shrink-0">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">Rufus Sam</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-secondary/50 border-0 focus-visible:bg-background focus-visible:border focus-visible:border-input"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{user.email}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/orders">Orders</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
