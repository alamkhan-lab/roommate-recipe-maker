import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-charcoal/20 backdrop-blur-md border-b border-cream/10">
      <div className="container mx-auto px-6 lg:px-16 flex items-center justify-between h-16">
        <a href="/" className="font-display text-xl font-bold text-cream tracking-tight">
          Room<span className="text-primary">Chef</span>
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="font-body text-sm text-cream/70 hover:text-cream transition-colors">Styles</a>
          <a href="#" className="font-body text-sm text-cream/70 hover:text-cream transition-colors">How It Works</a>
          <a href="#" className="font-body text-sm text-cream/70 hover:text-cream transition-colors">Gallery</a>
          <button className="bg-primary text-primary-foreground font-body text-sm font-medium px-5 py-2 rounded-lg hover:bg-primary/90 transition-all">
            Get Started
          </button>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-cream">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-charcoal/95 backdrop-blur-xl border-t border-cream/10 px-6 py-6 flex flex-col gap-4">
          <a href="#" className="font-body text-cream/70 hover:text-cream transition-colors">Styles</a>
          <a href="#" className="font-body text-cream/70 hover:text-cream transition-colors">How It Works</a>
          <a href="#" className="font-body text-cream/70 hover:text-cream transition-colors">Gallery</a>
          <button className="bg-primary text-primary-foreground font-body text-sm font-medium px-5 py-2.5 rounded-lg mt-2 w-full">
            Get Started
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
