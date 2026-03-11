import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Check, X, Search, Loader2 } from 'lucide-react';
import { api, Contact, SegmentationParam } from '@/lib/api';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SegmentationOption {
  id: string;
  label: string;
  description: string;
  affectedCount: number;
}

interface SegmentationPickerProps {
  selectedSegments: (string | SegmentationParam)[];
  onSegmentsChange: (segments: (string | SegmentationParam)[]) => void;
  stats?: Record<string, number>;
}

export function SegmentationPicker({ selectedSegments, onSegmentsChange, stats = {} }: SegmentationPickerProps) {
  const [previewContacts, setPreviewContacts] = React.useState<Contact[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = React.useState(false);

  const audienceFilters: SegmentationOption[] = [
    { id: 'by_purchase_count', label: 'Clientes por número de compras', description: 'Atribua um mínimo de compras', affectedCount: stats['by_purchase_count'] || 0 },
    { id: 'birthday', label: 'Aniversariantes do Mês', description: 'Clientes que fazem aniversário no mês atual', affectedCount: stats['birthday'] || 0 },
    { id: 'inactive_customers', label: 'Clientes inativos', description: 'Defina o período de inatividade (dias)', affectedCount: stats['inactive_customers'] || 0 },
    { id: 'high_ticket', label: 'Clientes com maior ticket médio', description: 'Defina o valor mínimo do ticket', affectedCount: stats['high_ticket'] || 0 },
    { id: 'lead_captured', label: 'Lead capturado', description: 'Lead obtido por formulário', affectedCount: stats['lead_captured'] || 0 },
    { id: 'no_purchase_x_days', label: 'Clientes que não compram há X dias', description: 'Inativos por período específico', affectedCount: stats['no_purchase_x_days'] || 0 },
    { id: 'active_coupon', label: 'Cupom ativo', description: 'Possuem cupons válidos', affectedCount: stats['active_coupon'] || 0 },
    { id: 'gender_male', label: 'Sexo: Masculino', description: 'Clientes do sexo masculino', affectedCount: stats['gender_male'] || 0 },
    { id: 'gender_female', label: 'Sexo: Feminino', description: 'Clientes do sexo feminino', affectedCount: stats['gender_female'] || 0 },
    { id: 'by_state', label: 'Estado', description: 'Segmentar por localização geográfica', affectedCount: Object.keys(stats).filter(k => k.startsWith('state_')).reduce((acc, k) => acc + stats[k], 0) || 0 },
  ];

  const toggleSegment = (segmentId: string) => {
    const isSelected = selectedSegments.some(s => (typeof s === 'string' ? s : s.id) === segmentId);
    if (isSelected) {
      onSegmentsChange(selectedSegments.filter(s => (typeof s === 'string' ? s : s.id) !== segmentId));
    } else {
      onSegmentsChange([...selectedSegments, segmentId]);
    }
  };

  const updateParams = (segmentId: string, params: any) => {
    const newSegments = selectedSegments.map(s => {
      const id = typeof s === 'string' ? s : s.id;
      if (id === segmentId) {
        return { id, params: { ...(typeof s === 'object' ? s.params : {}), ...params } };
      }
      return s;
    });
    onSegmentsChange(newSegments);
  };

  const getSegmentParams = (segmentId: string) => {
    const seg = selectedSegments.find(s => (typeof s === 'string' ? s : s.id) === segmentId);
    return typeof seg === 'object' ? seg.params : {};
  };

  React.useEffect(() => {
    const fetchPreview = async () => {
      if (selectedSegments.length === 0) {
        setPreviewContacts([]);
        return;
      }
      setIsLoadingPreview(true);
      try {
        const data = await api.getContactsBySegments(selectedSegments);
        setPreviewContacts(data);
      } catch (error) {
        console.error('Erro ao buscar preview:', error);
      } finally {
        setIsLoadingPreview(false);
      }
    };

    const timeoutId = setTimeout(fetchPreview, 500);
    return () => clearTimeout(timeoutId);
  }, [selectedSegments]);

  const renderConfigUI = (segmentId: string) => {
    const params = getSegmentParams(segmentId);

    if (segmentId === 'by_purchase_count') {
      return (
        <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Label className="text-[10px] uppercase font-bold text-muted-foreground whitespace-nowrap">Mín. Compras:</Label>
          <Input
            type="number"
            className="h-8 w-20 text-xs"
            value={params?.minPurchases || 1}
            onChange={(e) => updateParams(segmentId, { minPurchases: parseInt(e.target.value) || 1 })}
          />
        </div>
      );
    }

    if (segmentId === 'high_ticket') {
      return (
        <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Label className="text-[10px] uppercase font-bold text-muted-foreground whitespace-nowrap">Ticket Mín. (R$):</Label>
          <Input
            type="number"
            className="h-8 w-24 text-xs"
            value={params?.minTicket || 500}
            onChange={(e) => updateParams(segmentId, { minTicket: parseFloat(e.target.value) || 0 })}
          />
        </div>
      );
    }

    if (segmentId === 'inactive_customers' || segmentId === 'no_purchase_x_days') {
      return (
        <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Label className="text-[10px] uppercase font-bold text-muted-foreground whitespace-nowrap">Dias:</Label>
          <Input
            type="number"
            className="h-8 w-20 text-xs"
            value={params?.days || (segmentId === 'inactive_customers' ? 90 : 30)}
            onChange={(e) => updateParams(segmentId, { days: parseInt(e.target.value) || 0 })}
          />
        </div>
      );
    }

    return null;
  };

  const renderFilters = (segments: SegmentationOption[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {segments.map((segment) => {
        const isSelected = selectedSegments.some(s => (typeof s === 'string' ? s : s.id) === segment.id);
        return (
          <Card
            key={segment.id}
            className={`p-4 cursor-pointer hover:border-primary transition-all ${isSelected ? 'border-primary bg-primary/5 shadow-md' : ''
              }`}
            onClick={() => toggleSegment(segment.id)}
          >
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 ${isSelected
                ? 'bg-primary border-primary'
                : 'border-input'
                }`}>
                {isSelected && (
                  <Check className="w-3 h-3 text-primary-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium text-sm">{segment.label}</div>
                  <Badge variant="secondary" className="text-xs">
                    {segment.affectedCount.toLocaleString('pt-BR')} pessoas
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{segment.description}</p>
                {isSelected && renderConfigUI(segment.id)}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-primary/10 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground font-medium">
          Personalize seu público-alvo configurando os critérios abaixo.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-base">Filtros de Segmentação</h3>
          <Badge variant="secondary" className="ml-auto">
            {selectedSegments.length} ativos
          </Badge>
        </div>
        {renderFilters(audienceFilters)}
      </div>

      {selectedSegments.length > 0 && (
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm font-semibold mb-3">Filtros selecionados:</p>
            <div className="flex flex-wrap gap-2">
              {selectedSegments.map(s => {
                const id = typeof s === 'string' ? s : s.id;
                const segment = audienceFilters.find(opt => opt.id === id);
                return segment ? (
                  <Badge key={id} variant="secondary" className="gap-1 pl-2 pr-1 h-7">
                    {segment.label}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive ml-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSegment(id);
                      }}
                    />
                  </Badge>
                ) : null;
              })}
            </div>
          </div>

          <Card className="overflow-hidden border-primary/20 bg-primary/[0.02]">
            <div className="p-3 bg-muted/30 border-b flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Search className="w-4 h-4 text-primary" />
                Visualização em Tempo Real ({previewContacts.length})
              </div>
              {isLoadingPreview && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-transparent hover:bg-transparent">
                    <TableHead className="py-2 h-auto text-[11px] uppercase">Nome</TableHead>
                    <TableHead className="py-2 h-auto text-[11px] uppercase">E-mail</TableHead>
                    <TableHead className="py-2 h-auto text-[11px] uppercase">Localização</TableHead>
                    <TableHead className="py-2 h-auto text-[11px] uppercase text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingPreview && previewContacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-xs italic">
                        Carregando contatos...
                      </TableCell>
                    </TableRow>
                  ) : previewContacts.length > 0 ? (
                    previewContacts.map((contact) => (
                      <TableRow key={contact.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="py-2 text-xs font-medium">{contact.name}</TableCell>
                        <TableCell className="py-2 text-xs text-muted-foreground">{contact.email || '-'}</TableCell>
                        <TableCell className="py-2 text-xs text-muted-foreground">
                          {contact.city ? `${contact.city}, ${contact.state}` : contact.state || '-'}
                        </TableCell>
                        <TableCell className="py-2 text-right">
                          <Badge variant="outline" className="text-[10px] py-0 h-4 px-1.5 uppercase font-bold">
                            {contact.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-xs italic">
                        Nenhum contato encontrado para os filtros selecionados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
