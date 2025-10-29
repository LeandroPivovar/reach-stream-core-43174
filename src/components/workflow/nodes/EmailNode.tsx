import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Mail, Settings, Trash2 } from 'lucide-react';

interface EmailNodeData {
  subject?: string;
  content?: string;
  onUpdate: (data: { subject: string; content: string }) => void;
  onDelete: () => void;
}

export const EmailNode: React.FC<NodeProps> = ({ data, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [subject, setSubject] = useState((data as any)?.subject || '');
  const [content, setContent] = useState((data as any)?.content || '');

  const handleSave = () => {
    (data as any).onUpdate({ subject, content });
    setIsEditing(false);
  };

  return (
    <>
      <Card className="min-w-[200px] p-4 shadow-lg border-orange-500/50 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background hover:shadow-xl transition-shadow">
        <Handle type="target" position={Position.Top} className="!bg-orange-500 !w-3 !h-3" />
        
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-orange-500" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">Enviar E-mail</h4>
            <p className="text-xs text-muted-foreground truncate">
              {subject || 'Sem assunto definido'}
            </p>
          </div>
        </div>

        <div className="flex gap-1 mt-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsEditing(true)}
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={() => (data as any).onDelete()}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        <Handle type="source" position={Position.Bottom} className="!bg-orange-500 !w-3 !h-3" />
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar E-mail</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email-subject">Assunto</Label>
              <Input
                id="email-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Digite o assunto..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email-content">Conteúdo</Label>
              <textarea
                id="email-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Digite o conteúdo..."
                rows={6}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
