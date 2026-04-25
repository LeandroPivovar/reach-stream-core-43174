import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Phone, Settings, Trash2, Upload, X, Link2, Plus } from 'lucide-react';
import { api } from '@/lib/api';

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
  const [contentSid, setContentSid] = useState((data as any)?.contentSid || '');
  const [templateVariablesText, setTemplateVariablesText] = useState(
    JSON.stringify((data as any)?.templateVariables || { '1': '{{nome}}' }, null, 2),
  );
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [dynamicVariables, setDynamicVariables] = useState<Record<string, string>>((data as any)?.templateVariables || {});

  React.useEffect(() => {
    if (isEditing && templates.length === 0) {
      setIsLoadingTemplates(true);
      api.getTwilioTemplates()
        .then(res => {
          setTemplates(res || []);
          // Se já tem um contentSid salvo, inicializar as vars dinâmicas
          if (contentSid && res) {
            const currentTpl = res.find((t: any) => t.sid === contentSid);
            if (currentTpl && currentTpl.variables) {
               const savedVars = (data as any)?.templateVariables || {};
               const newVars: Record<string, string> = { ...savedVars };
               // Garante que todas as chaves do template existem no state
               Object.keys(currentTpl.variables).forEach(k => {
                 if (!newVars[k]) newVars[k] = '';
               });
               setDynamicVariables(newVars);
            }
          }
        })
        .catch(err => console.error(err))
        .finally(() => setIsLoadingTemplates(false));
    }
  }, [isEditing, templates]);

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
    let finalVars = templateVariablesText.trim() ? JSON.parse(templateVariablesText) : {};
    
    // Se selecionou um template da Twilio, usamos as dynamicVariables em vez do JSON bruto
    if (contentSid && contentSid !== 'none') {
       finalVars = dynamicVariables;
    }

    (data as any).onUpdate({
      content,
      media,
      destinationUrl,
      provider: 'twilio',
      contentSid: contentSid === 'none' ? undefined : (contentSid.trim() || undefined),
      templateVariables: finalVars,
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
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Configurar WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
            <div className="space-y-6 py-4 pb-8">
                <div className="space-y-4 rounded border p-4 bg-primary/5">
                  <div className="grid gap-2">
                    <Label htmlFor="twilio-content-sid">Template Aprovado (Content API)</Label>
                    <Select value={contentSid || 'none'} onValueChange={(val) => {
                      setContentSid(val === 'none' ? '' : val);
                      const tpl = templates.find(t => t.sid === val);
                      let detectedVars: Record<string, string> = {};
                      let bodyText = '';
                      let primaryType = '';

                      if (tpl && val !== 'none') {
                        const typeKeys = Object.keys(tpl.types || {});
                        // Tentar encontrar o body e identificar o tipo principal
                        for (const type of typeKeys) {
                          primaryType = type.split('/').pop() || type;
                          if (tpl.types[type].body) {
                            bodyText = tpl.types[type].body;
                            break;
                          }
                        }
                        
                        // 1. Extrair variáveis do corpo do texto usando Regex {{variável}}
                        // Esta é a fonte da verdade para o que a Twilio espera no disparo
                        const matches = bodyText.match(/{{[^{}]+}}/g);
                        if (matches) {
                          matches.forEach(match => {
                            const varName = match.replace(/[{}]/g, '');
                            detectedVars[varName] = '';
                          });
                        }

                        // 2. Se não encontrou nada via regex, tenta usar os metadados (como fallback)
                        if (Object.keys(detectedVars).length === 0 && tpl.variables) {
                          Object.keys(tpl.variables).forEach(k => {
                            detectedVars[k] = '';
                          });
                        }

                        if (bodyText) setContent(bodyText);
                      }
                      
                      setDynamicVariables(detectedVars);
                    }}>
                      <SelectTrigger id="twilio-content-sid">
                        <SelectValue placeholder={isLoadingTemplates ? "Carregando templates..." : "Selecione um template..."} />
                      </SelectTrigger>
                      <SelectContent>
                              {isLoadingTemplates && <SelectItem value="loading" disabled>Carregando templates...</SelectItem>}
                              {templates.map(t => {
                                const type = Object.keys(t.types || {})[0]?.split('/').pop() || 'unknown';
                                return (
                                  <SelectItem key={t.sid} value={t.sid}>
                                    <div className="flex items-center gap-2">
                                      <span>{t.friendlyName}</span>
                                      <span className={`text-[10px] px-1 rounded border font-mono ${
                                        type === 'list-picker' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                                      }`}>
                                        {type.toUpperCase()}
                                      </span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Selecione um modelo previamente aprovado na Meta para iniciar as conversas.
                    </p>
                  </div>

                  {contentSid && contentSid !== 'none' && Object.keys(dynamicVariables).length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-primary/20">
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold text-primary">Preencher Variáveis do Template</Label>
                        <div className="flex gap-1">
                          {[
                            { label: 'Cupom', value: '{{cupom_nome}}' },
                            { label: 'Valor', value: '{{cupom_valor}}' },
                            { label: 'Validade', value: '{{cupom_validade}}' },
                            { label: 'Link', value: '{{link_rastreio}}' },
                            { label: 'Nome', value: '{{nome}}' }
                          ].map(v => (
                            <Badge 
                              key={v.value} 
                              variant="outline" 
                              className="cursor-help text-[9px] px-1.5 py-0 hover:bg-primary/10 transition-colors"
                              title={`Use ${v.value} para substituir pelo valor dinâmico`}
                            >
                              {v.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="grid gap-3">
                        {Object.keys(dynamicVariables).map(key => (
                          <div key={key} className="grid grid-cols-[80px_1fr] items-center gap-2 bg-background p-2 rounded border group">
                            <Label className="text-xs font-mono text-muted-foreground bg-muted p-1 rounded text-center">
                              {"{{" + key + "}}"}
                            </Label>
                            <div className="relative">
                              <Input 
                                value={dynamicVariables[key] || ''}
                                onChange={e => setDynamicVariables({...dynamicVariables, [key]: e.target.value})}
                                placeholder={`Ex: {{nome}} ou texto fixo`}
                                className="h-8 text-sm pr-20"
                              />
                              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                {['{{nome}}', '{{cupom_nome}}', '{{link_rastreio}}'].map(v => (
                                  <Button
                                    key={v}
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-[10px]"
                                    onClick={() => setDynamicVariables({...dynamicVariables, [key]: (dynamicVariables[key] || '') + v})}
                                    title={`Inserir ${v}`}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">
                        Dica: Você pode usar variáveis do sistema como <strong>{"{{cupom_nome}}"}</strong>, <strong>{"{{link_rastreio}}"}</strong> ou <strong>{"{{nome}}"}</strong>.
                      </p>
                    </div>
                  )}
                  
                  {(!contentSid || contentSid === 'none') && (
                    <div className="grid gap-2 pt-2 border-t border-primary/10">
                    <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                      🚫 <strong>Template obrigatório:</strong> Para campanhas proativas via WhatsApp, é OBRIGATÓRIO selecionar um template aprovado na Meta. Mensagens sem template serão bloqueadas.
                    </p>
                  </div>
                  )}
                </div>

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
            </div>
          </div>
          
          <div className="flex justify-end gap-2 p-6 border-t bg-slate-50/50 dark:bg-slate-900/50">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!contentSid || contentSid === 'none'}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
