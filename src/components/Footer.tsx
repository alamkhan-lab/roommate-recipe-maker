const Footer = () => {
  return (
    <footer className="bg-foreground border-t border-background/10 py-12">
      <div className="container mx-auto px-6 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-display text-lg font-bold text-background tracking-tight">
          Room<span className="text-primary">Chef</span>
        </p>
        <p className="font-body text-background/40 text-sm">
          © 2026 RoomChef. Crafted with taste.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
