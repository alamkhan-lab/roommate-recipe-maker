import { motion } from "framer-motion";
import { Palette, Layers, Sparkles } from "lucide-react";

const steps = [
  {
    icon: Palette,
    number: "01",
    title: "Choose Your Style",
    description: "Browse our curated collection of design recipes spanning every aesthetic — from sleek modern to cozy rustic.",
  },
  {
    icon: Layers,
    number: "02",
    title: "Customize & Mix",
    description: "Adjust colors, materials, and layouts to match your taste. Combine elements from different styles to create something unique.",
  },
  {
    icon: Sparkles,
    number: "03",
    title: "Bring It to Life",
    description: "Get a detailed shopping list, layout guide, and step-by-step instructions to transform your space with confidence.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 lg:py-32 bg-card">
      <div className="container mx-auto px-6 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-primary font-body text-sm tracking-[0.3em] uppercase mb-4">
            How It Works
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Three Simple Steps
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
                <step.icon className="w-7 h-7" />
              </div>
              <p className="font-display text-5xl font-bold text-border mb-4">
                {step.number}
              </p>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="font-body text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
