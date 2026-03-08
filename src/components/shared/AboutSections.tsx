import { motion } from "framer-motion";

interface AboutSectionProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface AboutSectionsProps {
  sections: AboutSectionProps[];
}

export default function AboutSections({ sections }: AboutSectionsProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sections.map((section, i) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="rounded-2xl border bg-card p-8 space-y-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          {section.icon && <div className="mb-2">{section.icon}</div>}
          <h3 className="font-heading font-bold text-lg">{section.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{section.description}</p>
        </motion.div>
      ))}
    </div>
  );
}
