import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-room.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Beautiful modern living room with warm earth tones"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-16">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-primary-foreground/70 font-body text-sm tracking-[0.3em] uppercase mb-6"
          >
            Interior Design Reimagined
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-cream leading-[0.95] mb-8"
          >
            Cook Up
            <br />
            Your Dream
            <br />
            <span className="text-primary italic font-medium">Space</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-cream/70 font-body text-lg md:text-xl max-w-md mb-10 leading-relaxed"
          >
            Transform any room with curated design recipes. From minimalist to maximalist — find your perfect style.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex gap-4"
          >
            <button className="group flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-body font-medium text-base hover:bg-primary/90 transition-all">
              Start Designing
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="flex items-center gap-3 border border-cream/30 text-cream px-8 py-4 rounded-lg font-body font-medium text-base hover:bg-cream/10 transition-all">
              Explore Styles
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
