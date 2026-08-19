import { Card, CardContent } from "@/shared/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/utils/common/classnames";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  bgGradient?: string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-primary",
  bgGradient = "from-primary/10 to-primary/5",
  trend,
  onClick,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
        onClick && "cursor-pointer hover:scale-[1.02]"
      )}
      onClick={onClick}
    >
      {/* Background gradient */}
      <div className={cn("absolute inset-0 bg-gradient-to-br", bgGradient)} />
      
      <CardContent className="relative p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2 truncate">
              {title}
            </p>
            <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
              <h3 className="text-2xl sm:text-3xl font-bold break-words">{value}</h3>
              {trend && (
                <span
                  className={cn(
                    "text-xs sm:text-sm font-medium whitespace-nowrap",
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  )}
                >
                  {trend.isPositive ? "↑" : "↓"} {trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1.5 sm:mt-2.5 truncate">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              "rounded-full p-2 sm:p-3 bg-background/50 backdrop-blur-sm flex-shrink-0",
              iconColor
            )}
          >
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
