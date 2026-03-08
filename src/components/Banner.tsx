import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface BannerProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  variant?: "primary" | "accent" | "dark";
  align?: "left" | "center";
}

export default function Banner({
  title,
  subtitle,
  ctaText,
  ctaLink,
  secondaryCtaText,
  secondaryCtaLink,
  variant = "primary",
  align = "left",
}: BannerProps) {
  const bgMap = {
    primary: "bg-primary text-primary-foreground",
    accent: "bg-accent text-accent-foreground",
    dark: "bg-foreground text-background",
  };

  return (
    <section className={`${bgMap[variant]} rounded-2xl overflow-hidden`}>
      <div className={`px-8 py-12 md:px-16 md:py-16 ${align === "center" ? "text-center" : ""}`}>
        <h2 className="text-2xl md:text-4xl font-bold mb-3 leading-tight">{title}</h2>
        {subtitle && (
          <p className="text-sm md:text-base opacity-80 mb-6 max-w-lg mx-auto">{subtitle}</p>
        )}
        {(ctaText || secondaryCtaText) && (
          <div className={`flex gap-3 ${align === "center" ? "justify-center" : ""}`}>
            {ctaText && ctaLink && (
              <Button size="lg" variant="secondary" asChild>
                <Link to={ctaLink}>
                  {ctaText} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            {secondaryCtaText && secondaryCtaLink && (
              <Button size="lg" variant="outline" className="border-current text-current hover:bg-white/10" asChild>
                <Link to={secondaryCtaLink}>{secondaryCtaText}</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
