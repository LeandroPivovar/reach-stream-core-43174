import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Plus,
  Download,
  Filter,
  Menu,
  X
} from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showSearch?: boolean;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
}

export function Header({ title, subtitle, actions, showSearch = false, onSearchChange, searchValue }: HeaderProps) {
  const { toggleOpen, toggleCollapsed } = useSidebar();
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  return (
    <div className="bg-background border-b border-border px-4 md:px-6 py-3 md:py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Menu + Title */}
        <div className={cn(
          "flex items-center transition-all duration-300",
          isSearchVisible ? "hidden md:flex" : "flex flex-1"
        )}>
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:mr-4 lg:hidden shrink-0"
            onClick={toggleOpen}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:mr-4 hidden lg:flex shrink-0"
            onClick={toggleCollapsed}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="min-w-0">
            <h1 className="text-base md:text-lg font-semibold text-foreground truncate">{title}</h1>
            {subtitle && (
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 truncate hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Search + Actions + Notifications */}
        <div className={cn(
          "flex items-center gap-2 md:gap-4",
          isSearchVisible ? "flex-1" : ""
        )}>
          {showSearch && (
            <div className={cn(
              "relative transition-all duration-300",
              isSearchVisible ? "flex-1" : "w-auto"
            )}>
              {/* Desktop Search / Mobile Expanded Search */}
              <div className={cn(
                "items-center relative w-full",
                isSearchVisible ? "flex" : "hidden md:flex"
              )}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar..."
                  className="pl-10 w-full md:w-64 lg:w-80 h-9"
                  autoFocus={isSearchVisible}
                  value={searchValue || ''}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden ml-2"
                  onClick={() => setIsSearchVisible(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Mobile Search Trigger Icon */}
              {!isSearchVisible && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden"
                  onClick={() => setIsSearchVisible(true)}
                >
                  <Search className="w-5 h-5" />
                </Button>
              )}
            </div>
          )}

          {!isSearchVisible && (
            <>
              {actions && (
                <div className="flex items-center space-x-1 md:space-x-2">
                  <div className="hidden sm:flex items-center space-x-1 md:space-x-2">
                    {actions}
                  </div>
                  
                  {/* Mobile Actions Dropdown if more than 1 action would be better, 
                      but for now we'll rely on the parent providing responsive buttons 
                      or we can wrap it here. Actually, lets add a simple action menu for mobile.
                  */}
                  <div className="sm:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {/* We use a hack here to render the actions inside the dropdown 
                            This is tricky because 'actions' is a ReactNode.
                            A better approach is for pages to use HeaderActions 
                            which we'll make more responsive.
                        */}
                        <div className="p-1 flex flex-col gap-1">
                           {actions}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )}

              <NotificationCenter />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Predefined action buttons for common use cases
export const HeaderActions = {
  Add: ({ onClick, children, className }: { onClick?: () => void; children: string; className?: string }) => (
    <Button 
      onClick={onClick} 
      className={cn("bg-primary hover:bg-primary-hover h-9 shrink-0", className)}
    >
      <Plus className="w-4 h-4 mr-2" />
      <span className="hidden xs:inline">{children}</span>
      <span className="xs:hidden">{children.split(' ')[0]}</span>
    </Button>
  ),

  Export: ({ onClick, className }: { onClick?: () => void; className?: string }) => (
    <Button variant="outline" onClick={onClick} className={cn("h-9 shrink-0", className)}>
      <Download className="w-4 h-4 mr-2" />
      <span className="hidden md:inline">Exportar</span>
    </Button>
  ),

  Filter: ({ onClick, className }: { onClick?: () => void; className?: string }) => (
    <Button variant="outline" onClick={onClick} className={cn("h-9 shrink-0", className)}>
      <Filter className="w-4 h-4 mr-2" />
      <span className="hidden md:inline">Filtros</span>
    </Button>
  ),
};