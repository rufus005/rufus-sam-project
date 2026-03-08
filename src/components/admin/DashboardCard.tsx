import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  href?: string;
  trend?: string;
  subtitle?: string;
}

export default function DashboardCard({ label, value, icon: Icon, color, trend }: DashboardCardProps) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <span className="flex items-center gap-1 text-xs font-medium text-accent">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}
