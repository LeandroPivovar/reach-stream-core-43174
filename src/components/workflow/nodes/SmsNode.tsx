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
import { MessageSquare, Settings, Trash2, Link2, Plus } from 'lucide-react';

interface SmsNodeData {
  content?: string;
  destinationUrl?: string;
  onUpdate: (data: { content: string; destinationUrl?: string }) => void;
  onDelete: () => void;
}

export const SmsNode: React.FC<NodeProps> = ({ data, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState((data as any)?.content || '');
  const [destinationUrl, setDestinationUrl] = useState((data as any)?.destinationUrl || '');

  const handleSave = () => {
    (data as any).onUpdate({ content, destinationUrl });
    setIsEditing(false);
  };

  return (
    <>
      <Card className="min-w-[200px] p-4 shadow-lg border-blue-500/50 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background hover:shadow-xl transition-shadow">
        <Handle type="target" position={Position.Top} className="!bg-blue-500 !w-3 !h-3" />

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-blue-500" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">Enviar SMS</h4>
            <p className="text-xs text-muted-foreground truncate">
              {content ? `${content.substring(0, 30)}...` : 'Sem mensagem definida'}
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

        <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !w-3 !h-3" />
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar SMS</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sms-content">Mensagem SMS</Label>
              <textarea
                id="sms-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Digite a mensagem..."
                rows={4}
                maxLength={160}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <p className="text-xs text-muted-foreground">
                {content.length}/160 caracteres
              </p>
              <p className="text-xs text-muted-foreground bg-primary/5 p-2 rounded">
                💡 Variáveis: <strong>{"{{cupom_nome}}"}</strong>, <strong>{"{{cupom_valor}}"}</strong>, <strong>{"{{cupom_validade}}"}</strong> e <strong>{"{{link_rastreio}}"}</strong>
              </p>
            </div>

            <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 space-y-4">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Link de Redirecionamento</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="node-dest-url-sms" className="text-xs">URL de Destino</Label>
                <Input
                  id="node-dest-url-sms"
                  placeholder="https://seusite.com.br/promo"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs h-8"
                onClick={() => setContent(content + ' {{link_rastreio}}')}
              >
                <Plus className="w-3 h-3 mr-2" />
                Inserir Variável de Link
              </Button>
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
