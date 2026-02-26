import { motion } from "framer-motion";
import roomMinimal from "@/assets/room-minimal.jpg";
import roomLuxe from "@/assets/room-luxe.jpg";
import roomBoho from "@/assets/room-boho.jpg";

const styles = [
  {
    title: "Minimal",
    subtitle: "Scandinavian Calm",
    description: "Clean lines, natural light, and purposeful simplicity.",
    image: roomMinimal,
    tag: "Popular",
  },
  {
    title: "Luxe",
    subtitle: "Art Deco Glamour",
    description: "Rich textures, bold colors, and opulent details.",
    image: roomLuxe,
    tag: "Trending",
  },
  {
    title: "Bohemian",
    subtitle: "Warm & Eclectic",
    description: "Layered textures, warm hues, and collected charm.",
    image: roomBoho,
    tag: "New",
  },
];

const RoomShowcase = () => {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-primary font-body text-sm tracking-[0.3em] uppercase mb-4">
            Style Library
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            Find Your
            <br />
            <span className="italic font-medium text-muted-foreground">Recipe</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {styles.map((style, i) => (
            <motion.div
              key={style.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-xl mb-5 aspect-[3/4]">
                <img
                  src={style.image}
                  alt={`${style.title} interior design style`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
                <span className="absolute top-4 left-4 bg-primary/90 text-primary-foreground text-xs font-body font-medium tracking-wider uppercase px-3 py-1.5 rounded-md">
                  {style.tag}
                </span>
              </div>
              <h3 className="font-display text-2xl font-semibold text-foreground mb-1">
                {style.title}
              </h3>
              <p className="font-body text-sm text-primary font-medium mb-2">
                {style.subtitle}
              </p>
              <p className="font-body text-muted-foreground text-sm leading-relaxed">
                {style.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoomShowcase;
