import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface StatsCounterProps {
  icon: LucideIcon;
  value: number;
  suffix?: string;
  label: string;
  index?: number;
}

function useCountUp(target: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, startOnView]);

  return { count, ref };
}

export default function StatsCounter({ icon: Icon, value, suffix = "+", label, index = 0 }: StatsCounterProps) {
  const { count, ref } = useCountUp(value);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="flex flex-col items-center text-center p-6"
    >
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <span className="text-3xl md:text-4xl font-bold text-foreground">
        {count.toLocaleString()}{suffix}
      </span>
      <span className="text-sm text-muted-foreground mt-1">{label}</span>
    </motion.div>
  );
}
