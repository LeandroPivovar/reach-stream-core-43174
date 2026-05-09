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
import { Phone, Settings, Trash2, Upload, X, Link2, Plus, Library, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { translateTemplateName } from '@/lib/utils';
import { WhatsappPreview } from '@/components/campaigns/WhatsappPreview';

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
  const [lastFocusedField, setLastFocusedField] = useState<{ id: string; varKey?: string; selectionStart: number } | null>(null);

  const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLastFocusedField({
      id: e.target.id,
      varKey: e.target.getAttribute('data-var-key') || undefined,
      selectionStart: e.target.selectionStart || 0
    });
  };

  const handleInsertVariable = (variable: string) => {
    if (!lastFocusedField) {
      // Default to content if nothing focused
      setContent(prev => prev + variable);
      return;
    }

    const { id, varKey, selectionStart } = lastFocusedField;

    if (id === 'whatsapp-content') {
      const newContent = content.substring(0, selectionStart) + variable + content.substring(selectionStart);
      setContent(newContent);
    } else if (varKey) {
      const currentVal = dynamicVariables[varKey] || '';
      const newVal = currentVal.substring(0, selectionStart) + variable + currentVal.substring(selectionStart);
      setDynamicVariables(prev => ({ ...prev, [varKey]: newVal }));
    }

    // Update selection start for consecutive insertions
    setLastFocusedField(prev => prev ? { ...prev, selectionStart: prev.selectionStart + variable.length } : null);
  };

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

  const getMediaVariables = () => {
    const selectedTemplate = templates.find(t => t.sid === contentSid);
    const mediaVars: string[] = [];
    if (selectedTemplate) {
      Object.values(selectedTemplate.types || {}).forEach((typeData: any) => {
        if (typeData.media) {
          const mediaFields = Array.isArray(typeData.media) ? typeData.media : [typeData.media];
          mediaFields.forEach((field: any) => {
            if (typeof field === 'string') {
              const matches = field.match(/{{[^{}]+}}/g);
              if (matches) {
                matches.forEach(m => mediaVars.push(m.replace(/[{}]/g, '')));
              }
            }
          });
        }
      });
    }
    return mediaVars;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newMedia: { url: string; type: 'image' | 'video'; name: string }[] = [];
      
      for (const file of Array.from(files)) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/campaign-assets/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData,
          });
          
          if (response.ok) {
            const resData = await response.json();
            
            // Construir URL absoluta para o preview e para o Twilio (mesma lógica do Campanhas.tsx)
            const baseUrl = (import.meta.env.VITE_API_URL || '').includes('://') 
              ? (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : import.meta.env.VITE_API_URL)
              : window.location.origin;
            
            const fullUrl = resData.url.startsWith('http') ? resData.url : `${baseUrl}${resData.url}`;

            newMedia.push({
              url: fullUrl,
              type: (file.type.startsWith('video/') ? 'video' : 'image') as 'image' | 'video',
              name: file.name
            });
          }
        } catch (error) {
          console.error('Erro ao fazer upload:', error);
        }
      }
      
      if (newMedia.length > 0) {
        const updatedMedia = [...media, ...newMedia];
        setMedia(updatedMedia);

        // Auto-preenchimento de variáveis de mídia (igual ao Campanhas.tsx)
        const mediaVars = getMediaVariables();
        if (mediaVars.length > 0) {
          const vars = { ...dynamicVariables };
          const firstEmptyMediaVar = mediaVars.find(mv => !vars[mv]);
          if (firstEmptyMediaVar) {
            vars[firstEmptyMediaVar] = newMedia[0].url;
            setDynamicVariables(vars);
          }
        }
      }
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
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b">
            <DialogTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-500" />
                Configurar Mensagem WhatsApp
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex">
            {/* Esquerda: Configurações */}
            <div className="w-3/5 overflow-y-auto p-6 border-r custom-scrollbar">
              <div className="space-y-6 pb-8">
                <div className="space-y-4 rounded-xl border border-primary/20 p-5 bg-primary/5">
                  <div className="grid gap-2">
                    <Label htmlFor="twilio-content-sid" className="text-sm font-semibold flex items-center gap-2 text-primary">
                        <Sparkles className="w-4 h-4" />
                        Template Aprovado (Content API)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Select value={contentSid || 'none'} onValueChange={(val) => {
                          setContentSid(val === 'none' ? '' : val);
                          const tpl = templates.find(t => t.sid === val);
                          let detectedVars: Record<string, string> = {};
                          let bodyText = '';

                          if (tpl && val !== 'none') {
                            // 1. Priorizar os metadados de variáveis (Content API oficial)
                            if (tpl.variables && Object.keys(tpl.variables).length > 0) {
                              Object.keys(tpl.variables).forEach(k => {
                                detectedVars[k] = '';
                              });
                            }

                            // 2. Tentar encontrar o body em qualquer um dos tipos e extrair via Regex se as variáveis ainda estiverem vazias
                            const typeKeys = Object.keys(tpl.types || {});
                            for (const type of typeKeys) {
                              const typeData = tpl.types[type];
                              if (typeData.body) {
                                bodyText = typeData.body;
                                if (Object.keys(detectedVars).length === 0) {
                                  const matches = bodyText.match(/{{[^{}]+}}/g);
                                  if (matches) {
                                    matches.forEach(match => {
                                      const varName = match.replace(/[{}]/g, '');
                                      detectedVars[varName] = '';
                                    });
                                  }
                                }
                                break;
                              }
                            }
                            
                            if (bodyText) setContent(bodyText);
                          }
                          
                          setDynamicVariables(detectedVars);
                        }}>
                        <SelectTrigger id="twilio-content-sid" className="flex-1 h-11 bg-background">
                          <SelectValue placeholder={isLoadingTemplates ? "Carregando templates..." : "Selecione um template..."} />
                        </SelectTrigger>
                        <SelectContent>
                                {isLoadingTemplates && <SelectItem value="loading" disabled>Carregando templates...</SelectItem>}
                                {templates.map(t => {
                                  const type = Object.keys(t.types || {})[0]?.split('/').pop() || 'unknown';
                                  return (
                                    <SelectItem key={t.sid} value={t.sid}>
                                      <div className="flex items-center gap-2">
                                      <span>{translateTemplateName(t.friendlyName)}</span>
                                        <span className={`text-[10px] px-1.5 rounded-full border font-mono ${
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-11 px-4 text-xs border-primary/30 hover:bg-primary/10 flex items-center gap-1.5 whitespace-nowrap rounded-lg transition-all"
                        onClick={() => {
                          if ((data as any).onOpenTemplateModal) {
                            (data as any).onOpenTemplateModal();
                          }
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        Novo Template
                      </Button>
                    </div>
                  </div>

                  {contentSid && contentSid !== 'none' && (() => {
                    const selectedTemplate = templates.find(t => t.sid === contentSid);
                    const mediaVars: string[] = [];
                    if (selectedTemplate) {
                      Object.values(selectedTemplate.types || {}).forEach((typeData: any) => {
                        if (typeData.media) {
                          const mediaFields = Array.isArray(typeData.media) ? typeData.media : [typeData.media];
                          mediaFields.forEach((field: any) => {
                            if (typeof field === 'string') {
                              const matches = field.match(/{{[^{}]+}}/g);
                              if (matches) {
                                matches.forEach(m => mediaVars.push(m.replace(/[{}]/g, '')));
                              }
                            }
                          });
                        }
                      });
                    }

                    const mediaVars = getMediaVariables();
                    const listData = selectedTemplate?.types?.['twilio/list-picker'];
                    const displayVars = Object.keys(dynamicVariables);

                    if (displayVars.length === 0 && !listData) return null;

                    return (
                      <div className="space-y-4 pt-4 border-t border-primary/20">
                        <div className="flex items-center justify-between">
                          <Label className="font-semibold text-primary text-sm">Configurar Variáveis</Label>
                          <div className="flex gap-1">
                            {[
                              { label: 'Cupom', value: '{{cupom_nome}}' },
                              { label: 'Link', value: '{{link_rastreio}}' },
                              { label: 'Nome', value: '{{nome}}' }
                            ].map(v => (
                              <Badge 
                                key={v.value} 
                                variant="outline" 
                                className="cursor-pointer text-[10px] px-2 py-0.5 hover:bg-primary/10 transition-colors bg-white/50"
                                onClick={() => handleInsertVariable(v.value)}
                              >
                                {v.label}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {displayVars.length > 0 && (
                          <div className="grid gap-3">
                            {displayVars.map(key => (
                              <div key={key} className="grid grid-cols-[80px_1fr] items-center gap-3 bg-white/80 p-2.5 rounded-lg border group shadow-sm">
                                <div className="flex flex-col gap-1 items-center">
                                  <Label className="text-xs font-mono text-muted-foreground bg-muted p-1 rounded text-center w-full">
                                    {"{{" + key + "}}"}
                                  </Label>
                                  {mediaVars.includes(key) && (
                                    <Badge variant="outline" className="text-[8px] px-1 py-0 border-amber-300 text-amber-700 bg-amber-50">MÍDIA</Badge>
                                  )}
                                </div>
                                <div className="relative">
                                  <Input 
                                    value={dynamicVariables[key] || ''}
                                    data-var-key={key}
                                    onBlur={handleFieldBlur}
                                    onChange={e => setDynamicVariables({...dynamicVariables, [key]: e.target.value})}
                                    placeholder={mediaVars.includes(key) ? "URL da imagem ou vídeo" : `Ex: {{nome}} ou texto fixo`}
                                    className="h-9 text-sm pr-20 bg-background"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {listData && (
                          <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3">
                            <Label className="text-[10px] uppercase font-bold text-amber-700 flex items-center gap-1.5 tracking-wider">
                              <Library className="w-3.5 h-3.5" /> Opções da Lista (Preview)
                            </Label>
                            <div className="space-y-2">
                              {listData.items?.map((item: any, idx: number) => (
                                <div key={idx} className="text-xs p-2.5 bg-white rounded-lg border border-amber-100 flex items-center justify-between shadow-sm">
                                  <span className="font-semibold text-amber-900">{item.item}</span>
                                  {item.description && <span className="text-[10px] text-muted-foreground italic">{item.description}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {(!contentSid || contentSid === 'none') && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-700 font-medium leading-relaxed">
                        🚫 <strong>Template obrigatório:</strong> Para campanhas proativas, a Meta exige o uso de templates aprovados. Mensagens de texto livre serão bloqueadas pelo provedor.
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="whatsapp-content" className="font-bold text-sm">Corpo da Mensagem</Label>
                        <div className="flex gap-1.5">
                            {[
                                { label: 'Nome', value: '{{nome}}' },
                                { label: 'Cupom', value: '{{cupom_nome}}' },
                                { label: 'Link', value: '{{link_rastreio}}' }
                            ].map(v => (
                                <Badge 
                                    key={v.value} 
                                    variant="secondary" 
                                    className="cursor-pointer text-[10px] h-6 px-2 hover:bg-primary hover:text-white transition-all"
                                    onClick={() => handleInsertVariable(v.value)}
                                >
                                    {v.label}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <textarea
                        id="whatsapp-content"
                        value={content}
                        onBlur={handleFieldBlur}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Digite a mensagem..."
                        rows={6}
                        className="flex w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-shadow shadow-sm resize-none"
                    />
                    <div className="flex justify-between items-center px-1">
                        <p className="text-[11px] text-muted-foreground italic">
                            Use *negrito*, _itálico_ ou ~tachado~ para formatar.
                        </p>
                        <span className="text-[11px] font-mono text-muted-foreground">{content.length} caracteres</span>
                    </div>
                </div>

                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Link2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-bold text-blue-900">Configuração do Rastreamento</span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="node-dest-url" className="text-xs font-semibold text-blue-700">URL de Destino Final</Label>
                    <Input
                      id="node-dest-url"
                      placeholder="https://meusite.com.br/promocao"
                      value={destinationUrl}
                      onChange={(e) => setDestinationUrl(e.target.value)}
                      className="h-10 text-sm bg-white border-blue-200"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-9 bg-white hover:bg-blue-50 border-blue-200 text-blue-700 rounded-lg shadow-sm"
                    onClick={() => setContent(content + ' {{link_rastreio}}')}
                  >
                    <Plus className="w-3.5 h-3.5 mr-2" />
                    Adicionar Variável de Link ao Texto
                  </Button>
                </div>

                {(() => {
                  const selectedTemplate = templates.find(t => t.sid === contentSid);
                  const isMediaTemplate = selectedTemplate && Object.keys(selectedTemplate.types || {}).some(type => type.toLowerCase().includes('media'));
                  
                  if (!isMediaTemplate) return null;

                  return (
                    <div className="grid gap-3 pt-2">
                      <Label className="font-bold text-sm">Mídia do Template (Imagem ou Vídeo)</Label>
                      <div className="flex flex-col gap-4">
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
                            <Button type="button" variant="outline" className="w-full h-12 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all" asChild>
                              <div className="cursor-pointer">
                                <Upload className="w-4 h-4 mr-2" />
                                Escolher arquivos do dispositivo
                              </div>
                            </Button>
                          </label>
                        </div>
                        {media.length > 0 && (
                          <div className="grid grid-cols-2 gap-3">
                            {media.map((item, index) => (
                              <div key={index} className="relative group border-2 border-primary/10 rounded-xl p-2.5 bg-white shadow-sm hover:border-primary/30 transition-all">
                                <div className="flex items-center gap-3">
                                  {item.type === 'image' ? (
                                    <img src={item.url} alt={item.name} crossOrigin="anonymous" className="w-14 h-14 object-cover rounded-lg shadow-inner" />
                                  ) : (
                                    <video src={item.url} crossOrigin="anonymous" className="w-14 h-14 object-cover rounded-lg shadow-inner" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-medium truncate">{item.name}</p>
                                    <p className="text-[9px] text-muted-foreground uppercase">{item.type}</p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-red-50 hover:text-red-500 rounded-full"
                                    onClick={() => removeMedia(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Direita: Preview */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-8 flex flex-col items-center justify-center space-y-6">
                <div className="w-full max-w-[320px]">
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">Pré-visualização</Badge>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Mockup do WhatsApp</span>
                    </div>
                    
                    <div className="transform scale-110 origin-top">
                        <WhatsappPreview
                            content={content}
                            media={media}
                        />
                    </div>
                </div>

                <div className="max-w-[280px] text-center space-y-2">
                    <p className="text-xs font-semibold text-slate-500">
                        Como a mensagem aparecerá para o seu cliente
                    </p>
                    <p className="text-[10px] text-slate-400 italic">
                        Nota: Variáveis dinâmicas como {"{{nome}}"} serão substituídas pelos dados reais no momento do envio.
                    </p>
                </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 p-6 border-t bg-white dark:bg-background">
            <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl px-6">
              Cancelar
            </Button>
            <Button 
                onClick={handleSave} 
                disabled={!contentSid || contentSid === 'none'}
                className="rounded-xl px-8 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20"
            >
                Confirmar Configuração
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

