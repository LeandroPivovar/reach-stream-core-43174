import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  colorClass?: string;
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  className,
  colorClass = "bg-primary/10 text-primary"
}: StatsCardProps) {
  return (
    <div className={cn("card-stats p-3 2xl:p-6", colorClass, className)}>
      <div className="flex items-start justify-between gap-2 2xl:gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] md:text-xs 2xl:text-sm font-medium text-muted-foreground mb-1 truncate" title={title}>
            {title}
          </p>
          <p className="text-base sm:text-lg 2xl:text-2xl font-bold text-foreground truncate tracking-tight" title={String(value)}>
            {value}
          </p>
          
          {trend && (
            <div className="flex flex-wrap items-center mt-1 2xl:mt-2 gap-x-1.5">
              <span className={cn(
                "text-[10px] 2xl:text-xs font-semibold",
                trend.isPositive 
                  ? "text-success" 
                  : "text-destructive"
              )}>
                {trend.isPositive ? '+' : ''}{typeof trend.value === 'number' ? (Number.isInteger(trend.value) ? trend.value : trend.value.toFixed(2)) : trend.value}%
              </span>
              <span className="text-[9px] 2xl:text-[10px] text-muted-foreground whitespace-nowrap">
                vs anterior
              </span>
            </div>
          )}
          
          {description && (
            <p className="text-[9px] 2xl:text-[10px] text-muted-foreground mt-0.5 2xl:mt-1 truncate" title={description}>
              {description}
            </p>
          )}
        </div>
        
        <div className="shrink-0 block xl:hidden 2xl:block">
          <div className="w-8 h-8 2xl:w-12 2xl:h-12 bg-white/20 dark:bg-black/20 rounded-lg flex items-center justify-center">
            <Icon className="w-4 h-4 2xl:w-6 2xl:h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}