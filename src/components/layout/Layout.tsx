import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showSearch?: boolean;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
}

export function Layout({ children, title, subtitle, actions, showSearch, onSearchChange, searchValue }: LayoutProps) {
  const { isOpen, isCollapsed, closeMobile } = useSidebar();

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      <Sidebar />
      
      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[55] lg:hidden animate-in fade-in duration-300" 
          onClick={closeMobile}
        />
      )}
      
      <div 
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out overflow-hidden",
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        <Header 
          title={title} 
          subtitle={subtitle} 
          actions={actions} 
          showSearch={showSearch}
          onSearchChange={onSearchChange}
          searchValue={searchValue}
        />
        
        <main className="flex-1 p-4 md:p-6 overflow-auto custom-scrollbar">
          <div className="animate-fade-in max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}