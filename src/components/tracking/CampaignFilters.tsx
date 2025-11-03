import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Filter, 
  Calendar as CalendarIcon,
  X,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CampaignFiltersProps {
  onFilterChange?: (filters: any) => void;
}

export function CampaignFilters({ onFilterChange }: CampaignFiltersProps) {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [period, setPeriod] = useState<string>('geral');
  
  const campaigns = [
    { id: 'bf2025', name: 'Black Friday 2025', active: true },
    { id: 'newsletter', name: 'Newsletter Semanal', active: true },
    { id: 'fidelidade', name: 'Campanha Fidelidade', active: true },
    { id: 'lancamento', name: 'Lançamento Produto', active: false },
    { id: 'verao', name: 'Promoção Verão', active: true }
  ];

  const handleCampaignToggle = (campaignId: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignId) 
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    if (value !== 'custom') {
      setDateRange({});
    }
  };

  const clearFilters = () => {
    setSelectedCampaigns([]);
    setDateRange({});
    setPeriod('geral');
    onFilterChange?.({ campaigns: [], period: 'geral', dateRange: {} });
  };

  const applyFilters = () => {
    onFilterChange?.({
      campaigns: selectedCampaigns,
      period,
      dateRange
    });
  };

  const hasActiveFilters = selectedCampaigns.length > 0 || period !== 'geral' || dateRange.from;

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Filtro de Campanhas */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Campanhas
              {selectedCampaigns.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedCampaigns.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">Selecione as Campanhas</h4>
                <div className="space-y-2">
                  {campaigns.map(campaign => (
                    <div key={campaign.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={campaign.id}
                        checked={selectedCampaigns.includes(campaign.id)}
                        onCheckedChange={() => handleCampaignToggle(campaign.id)}
                      />
                      <label
                        htmlFor={campaign.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 flex-1 cursor-pointer"
                      >
                        {campaign.name}
                        {campaign.active && (
                          <Badge variant="default" className="text-xs">Ativa</Badge>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setSelectedCampaigns([])}
                  className="flex-1"
                >
                  Limpar
                </Button>
                <Button 
                  size="sm" 
                  onClick={applyFilters}
                  className="flex-1"
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Filtro de Período */}
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[180px]">
            <CalendarIcon className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="geral">Geral</SelectItem>
            <SelectItem value="hoje">Hoje</SelectItem>
            <SelectItem value="7dias">Últimos 7 dias</SelectItem>
            <SelectItem value="30dias">Últimos 30 dias</SelectItem>
            <SelectItem value="90dias">Últimos 90 dias</SelectItem>
            <SelectItem value="custom">Período personalizado</SelectItem>
          </SelectContent>
        </Select>

        {/* Seletor de Data Personalizado */}
        {period === 'custom' && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="w-4 h-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} -{' '}
                      {format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}
                    </>
                  ) : (
                    format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })
                  )
                ) : (
                  'Selecionar datas'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                locale={ptBR}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        )}

        {/* Botão Aplicar Filtros */}
        <Button onClick={applyFilters} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Aplicar Filtros
        </Button>

        {/* Botão Limpar Filtros */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="gap-2">
            <X className="w-4 h-4" />
            Limpar Tudo
          </Button>
        )}
      </div>

      {/* Tags de Filtros Ativos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
          {selectedCampaigns.map(campaignId => {
            const campaign = campaigns.find(c => c.id === campaignId);
            return campaign ? (
              <Badge key={campaignId} variant="secondary" className="gap-1">
                {campaign.name}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-destructive" 
                  onClick={() => handleCampaignToggle(campaignId)}
                />
              </Badge>
            ) : null;
          })}
          {period !== 'geral' && (
            <Badge variant="secondary" className="gap-1">
              {period === 'custom' && dateRange.from
                ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${dateRange.to ? format(dateRange.to, 'dd/MM/yyyy') : '...'}`
                : period === 'hoje' ? 'Hoje'
                : period === '7dias' ? 'Últimos 7 dias'
                : period === '30dias' ? 'Últimos 30 dias'
                : 'Últimos 90 dias'}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => handlePeriodChange('geral')}
              />
            </Badge>
          )}
        </div>
      )}
    </Card>
  );
}
