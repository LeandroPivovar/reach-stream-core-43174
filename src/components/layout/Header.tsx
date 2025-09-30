import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bell, 
  Search, 
  Settings,
  Plus,
  Download,
  Filter
} from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showSearch?: boolean;
}

export function Header({ title, subtitle, actions, showSearch = false }: HeaderProps) {
  return (
    <div className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar..."
                className="pl-10 w-80"
              />
            </div>
          )}

          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}

          <Button variant="ghost" size="icon">
            <Bell className="w-4 h-4" />
          </Button>

          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Predefined action buttons for common use cases
export const HeaderActions = {
  Add: ({ onClick, children }: { onClick?: () => void; children: string }) => (
    <Button onClick={onClick} className="bg-primary hover:bg-primary-hover">
      <Plus className="w-4 h-4 mr-2" />
      {children}
    </Button>
  ),
  
  Export: ({ onClick }: { onClick?: () => void }) => (
    <Button variant="outline" onClick={onClick}>
      <Download className="w-4 h-4 mr-2" />
      Exportar
    </Button>
  ),
  
  Filter: ({ onClick }: { onClick?: () => void }) => (
    <Button variant="outline" onClick={onClick}>
      <Filter className="w-4 h-4 mr-2" />
      Filtros
    </Button>
  ),
};