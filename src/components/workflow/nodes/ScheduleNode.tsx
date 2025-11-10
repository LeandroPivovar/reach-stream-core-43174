import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Clock, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ScheduleNodeData {
  label: string;
  scheduleDate?: Date;
  scheduleTime?: string;
  onUpdate?: (data: any) => void;
}

export const ScheduleNode: React.FC<{ data: ScheduleNodeData }> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(data.scheduleDate);
  const [scheduleTime, setScheduleTime] = useState(data.scheduleTime || '');

  const handleSave = () => {
    if (data.onUpdate) {
      data.onUpdate({
        scheduleDate,
        scheduleTime,
      });
    }
    setIsOpen(false);
  };

  const isConfigured = scheduleDate && scheduleTime;

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ background: '#3b82f6' }} />
      <Card className="w-64 p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/30 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Agendar Envio</h3>
            <p className="text-xs text-muted-foreground">Data e hora específicas</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Edit className="w-3 h-3" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurar Agendamento</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label>Data do Envio *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !scheduleDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduleDate ? format(scheduleDate, "dd/MM/yyyy") : <span>Selecione a data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={scheduleDate}
                        onSelect={setScheduleDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="schedule-time">Horário do Envio *</Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={!scheduleDate || !scheduleTime}>
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isConfigured ? (
          <div className="mt-3 p-3 bg-background/50 rounded-md border">
            <div className="flex items-center gap-2 text-xs">
              <CalendarIcon className="w-3 h-3 text-blue-500" />
              <span className="font-medium">
                {scheduleDate && format(scheduleDate, "dd/MM/yyyy")}
              </span>
              <Clock className="w-3 h-3 text-blue-500 ml-2" />
              <span className="font-medium">{scheduleTime}</span>
            </div>
          </div>
        ) : (
          <div className="mt-3 p-3 bg-background/50 rounded-md border">
            <p className="text-xs text-muted-foreground">
              Clique no ícone para configurar data e horário
            </p>
          </div>
        )}
      </Card>
      <Handle type="source" position={Position.Bottom} style={{ background: '#3b82f6' }} />
    </>
  );
};
