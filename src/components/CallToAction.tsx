import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CallToAction = () => {
  return (
    <section className="py-24 lg:py-32 bg-foreground">
      <div className="container mx-auto px-6 lg:px-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-background leading-tight mb-6">
            Ready to Transform
            <br />
            Your Space?
          </h2>
          <p className="font-body text-background/60 text-lg max-w-md mx-auto mb-10">
            Join thousands of design enthusiasts who've already found their perfect room recipe.
          </p>
          <button className="group inline-flex items-center gap-3 bg-primary text-primary-foreground px-10 py-4 rounded-lg font-body font-medium text-base hover:bg-primary/90 transition-all">
            Get Started Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;
