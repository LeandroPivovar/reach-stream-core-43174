import React from 'react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

export interface Column<T> {
  header: React.ReactNode;
  accessorKey?: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  className?: string;
  mobileHidden?: boolean;
}

interface ResponsiveTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  renderMobileCard?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function ResponsiveTable<T extends { id?: string | number }>({
  columns,
  data,
  isLoading,
  renderMobileCard,
  emptyMessage = "Nenhum dado encontrado",
  onRowClick,
  className,
}: ResponsiveTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Carregando dados...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* View Desktop: Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              {columns.map((col, idx) => (
                <TableHead 
                    key={idx} 
                    className={cn(
                        "font-semibold text-muted-foreground py-3",
                        col.className
                    )}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, rowIdx) => (
              <TableRow 
                key={item.id || rowIdx}
                className={cn(
                  "hover:bg-muted/40 transition-colors cursor-pointer",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col, colIdx) => (
                  <TableCell key={colIdx} className={cn("py-4", col.className)}>
                    {col.cell 
                      ? col.cell(item) 
                      : (col.accessorKey ? (item as any)[col.accessorKey] : null)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Mobile: Cards */}
      <div className="md:hidden space-y-4">
        {data.map((item, idx) => (
          <Card 
            key={item.id || idx} 
            className={cn(
                "p-4 hover:border-primary transition-all active:scale-[0.98]",
                onRowClick && "cursor-pointer"
            )}
            onClick={() => onRowClick?.(item)}
          >
            {renderMobileCard ? (
              renderMobileCard(item)
            ) : (
                <div className="space-y-3">
                    {/* Default Mobile View: Key/Value pairs */}
                    {columns.filter(c => !c.mobileHidden).map((col, cIdx) => (
                        <div key={cIdx} className="flex justify-between items-start gap-4 pb-2 border-b border-border last:border-0 last:pb-0">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{col.header}</span>
                            <div className="text-sm font-semibold text-right">
                                {col.cell 
                                    ? col.cell(item) 
                                    : (col.accessorKey ? (item as any)[col.accessorKey] : null)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
