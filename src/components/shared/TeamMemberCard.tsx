import { motion } from "framer-motion";

interface TeamMemberCardProps {
  name: string;
  role: string;
  bio: string;
  avatar?: string;
  index?: number;
}

export default function TeamMemberCard({ name, role, bio, avatar, index = 0 }: TeamMemberCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group flex flex-col items-center text-center p-8 rounded-2xl border bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-5 overflow-hidden ring-4 ring-card group-hover:ring-primary/20 transition-all duration-300">
        {avatar ? (
          <img src={avatar} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-3xl font-bold text-primary">{name.charAt(0)}</span>
        )}
      </div>
      <h3 className="font-heading font-bold text-lg">{name}</h3>
      <p className="text-sm text-primary font-medium mb-3">{role}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
    </motion.div>
  );
}
