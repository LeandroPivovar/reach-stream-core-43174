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
    <div className={cn("card-stats p-4 md:p-6", colorClass, className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1 truncate">
            {title}
          </p>
          <p className="text-xl md:text-2xl font-bold text-foreground truncate">
            {value}
          </p>
          
          {trend && (
            <div className="flex flex-wrap items-center mt-2 gap-x-2">
              <span className={cn(
                "text-xs font-semibold",
                trend.isPositive 
                  ? "text-success" 
                  : "text-destructive"
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">
                vs anterior
              </span>
            </div>
          )}
          
          {description && (
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1 truncate">
              {description}
            </p>
          )}
        </div>
        
        <div className="shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 dark:bg-black/20 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 md:w-6 md:h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}