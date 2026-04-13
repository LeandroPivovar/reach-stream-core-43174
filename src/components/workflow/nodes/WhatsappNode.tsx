import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Phone, Settings, Trash2, Upload, X, Link2, Plus } from 'lucide-react';

interface WhatsappNodeData {
  content?: string;
  media?: { url: string; type: 'image' | 'video'; name: string }[];
  destinationUrl?: string;
  provider?: 'zenvia' | 'twilio';
  contentSid?: string;
  templateVariables?: Record<string, string>;
  onUpdate: (data: {
    content: string;
    media?: { url: string; type: 'image' | 'video'; name: string }[];
    destinationUrl?: string;
    provider?: 'zenvia' | 'twilio';
    contentSid?: string;
    templateVariables?: Record<string, string>;
  }) => void;
  onDelete: () => void;
}

export const WhatsappNode: React.FC<NodeProps> = ({ data, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState((data as any)?.content || '');
  const [media, setMedia] = useState<{ url: string; type: 'image' | 'video'; name: string }[]>((data as any)?.media || []);
  const [destinationUrl, setDestinationUrl] = useState((data as any)?.destinationUrl || '');
  const [provider, setProvider] = useState<'zenvia' | 'twilio'>((data as any)?.provider || 'zenvia');
  const [contentSid, setContentSid] = useState((data as any)?.contentSid || '');
  const [templateVariablesText, setTemplateVariablesText] = useState(
    JSON.stringify((data as any)?.templateVariables || { '1': '{{nome}}' }, null, 2),
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newMedia = Array.from(files).map(file => ({
        url: URL.createObjectURL(file),
        type: (file.type.startsWith('video/') ? 'video' : 'image') as 'image' | 'video',
        name: file.name
      }));
      setMedia([...media, ...newMedia]);
    }
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    let templateVariables: Record<string, string> = {};
    try {
      templateVariables = templateVariablesText.trim() ? JSON.parse(templateVariablesText) : {};
    } catch {
      templateVariables = {};
    }

    (data as any).onUpdate({
      content,
      media,
      destinationUrl,
      provider,
      contentSid: contentSid.trim() || undefined,
      templateVariables,
    });
    setIsEditing(false);
  };

  return (
    <>
      <Card className="min-w-[200px] p-4 shadow-lg border-green-500/50 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background hover:shadow-xl transition-shadow">
        <Handle type="target" position={Position.Top} className="!bg-green-500 !w-3 !h-3" />

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <Phone className="w-5 h-5 text-green-500" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">Enviar WhatsApp</h4>
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

        <Handle type="source" position={Position.Bottom} className="!bg-green-500 !w-3 !h-3" />
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Provedor WhatsApp</Label>
              <Select value={provider} onValueChange={(value: 'zenvia' | 'twilio') => setProvider(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zenvia">Zenvia</SelectItem>
                  <SelectItem value="twilio">Twilio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {provider === 'twilio' && (
              <div className="space-y-3 rounded border p-3 bg-primary/5">
                <div className="grid gap-2">
                  <Label htmlFor="twilio-content-sid">Content SID (Template WhatsApp)</Label>
                  <Input
                    id="twilio-content-sid"
                    placeholder="HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={contentSid}
                    onChange={(e) => setContentSid(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Se preenchido, a campanha envia template aprovado da Twilio. Se vazio, envia texto livre.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="twilio-template-vars">Variáveis do Template (JSON)</Label>
                  <textarea
                    id="twilio-template-vars"
                    value={templateVariablesText}
                    onChange={(e) => setTemplateVariablesText(e.target.value)}
                    rows={5}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Exemplo: {"{ \"1\": \"João\", \"2\": \"15/05/2026\" }"}
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="whatsapp-content">Mensagem WhatsApp</Label>
              <textarea
                id="whatsapp-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Digite a mensagem..."
                rows={6}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <p className="text-xs text-muted-foreground bg-primary/5 p-2 rounded">
                💡 Variáveis disponíveis: <br />
                <strong>{"{{cupom_nome}}"}</strong>, <strong>{"{{cupom_valor}}"}</strong>, <strong>{"{{cupom_validade}}"}</strong> e <strong>{"{{link_rastreio}}"}</strong>
              </p>
            </div>

            <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 space-y-4">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Link de Redirecionamento</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="node-dest-url" className="text-xs">URL de Destino</Label>
                <Input
                  id="node-dest-url"
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

            <div className="grid gap-2">
              <Label>Anexar Imagem ou Vídeo</Label>
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="whatsapp-media-upload"
                  />
                  <label htmlFor="whatsapp-media-upload">
                    <Button type="button" variant="outline" className="w-full" asChild>
                      <div className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload de Mídia
                      </div>
                    </Button>
                  </label>
                </div>
                {media.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {media.map((item, index) => (
                      <div key={index} className="relative group border rounded-md p-2">
                        <div className="flex items-center gap-2">
                          {item.type === 'image' ? (
                            <img src={item.url} alt={item.name} className="w-12 h-12 object-cover rounded" />
                          ) : (
                            <video src={item.url} className="w-12 h-12 object-cover rounded" />
                          )}
                          <span className="text-xs truncate flex-1">{item.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeMedia(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
