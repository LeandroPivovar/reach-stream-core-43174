import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { List, ExternalLink, Phone, MessageSquare, ChevronRight } from 'lucide-react';

export interface WhatsappButton {
  type: 'url' | 'phone' | 'quick_reply';
  text: string;
  url?: string;
  phone?: string;
}

export interface WhatsappListItem {
  item: string;
  description?: string;
}

interface WhatsappPreviewProps {
  content: string;
  media: { url: string; type: 'image' | 'video'; name: string }[];
  templateType?: string;       // 'call-to-action' | 'list-picker' | 'media' | 'text' | 'quick-reply'
  buttons?: WhatsappButton[];
  listItems?: WhatsappListItem[];
  listButton?: string;
}

export const WhatsappPreview: React.FC<WhatsappPreviewProps> = ({
  content,
  media,
  templateType,
  buttons = [],
  listItems = [],
  listButton,
}) => {
  const now = new Date();
  const hasContent = !!(content || media.length > 0);
  const hasButtons = buttons.length > 0;
  const hasList = listItems.length > 0;

  const getButtonIcon = (type: WhatsappButton['type']) => {
    switch (type) {
      case 'url': return <ExternalLink className="w-3 h-3 mr-1.5" />;
      case 'phone': return <Phone className="w-3 h-3 mr-1.5" />;
      case 'quick_reply': return <MessageSquare className="w-3 h-3 mr-1.5" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-shrink-0 w-[320px]">
      {/* Phone Frame */}
      <div className="relative w-full max-w-[320px] h-[640px] bg-black rounded-[3rem] p-3 shadow-2xl">
        {/* Screen */}
        <div className="w-full h-full bg-[#ECE5DD] rounded-[2.5rem] overflow-hidden flex flex-col">
          {/* WhatsApp Header */}
          <div className="bg-[#075E54] text-white px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold">
              NC
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">Núcleo CRM</div>
              <div className="text-xs opacity-80">online</div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 p-3 overflow-y-auto" style={{ background: '#ECE5DD' }}>
            <div className="flex flex-col items-end gap-1">

              {hasContent ? (
                <div className="w-full flex flex-col items-end">
                  {/* Main Bubble */}
                  <div className="bg-[#DCF8C6] rounded-t-xl rounded-bl-xl max-w-[90%] shadow-sm overflow-hidden">
                    {/* Media */}
                    {media.length > 0 && (
                      <div className="mb-0">
                        {media.map((item, index) => (
                          <div key={index} className="overflow-hidden">
                            {item.type === 'image' ? (
                              <img
                                src={item.url}
                                alt={item.name}
                                className="w-full h-auto max-h-[160px] object-cover"
                              />
                            ) : (
                              <video
                                src={item.url}
                                className="w-full h-auto max-h-[160px] object-cover"
                                controls
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Text Content */}
                    {content && (
                      <div className="text-sm text-gray-800 whitespace-pre-wrap break-words px-3 py-2">
                        {content}
                      </div>
                    )}

                    {/* Timestamp inside bubble */}
                    <div className="flex items-center justify-end gap-1 px-3 pb-1.5">
                      <span className="text-[9px] text-gray-500">
                        {formatDistanceToNow(now, { locale: ptBR, addSuffix: true })}
                      </span>
                      <svg width="14" height="10" viewBox="0 0 16 11" fill="none">
                        <path d="M11.071 0.929L6 6l-1.071-1.071-1.414 1.414L6 8.828l6.485-6.485L11.071.929z" fill="#4FC3F7"/>
                        <path d="M15.071 0.929L10 6l-1.071-1.071-1.414 1.414L10 8.828l6.485-6.485L15.071.929z" fill="#4FC3F7"/>
                      </svg>
                    </div>
                  </div>

                  {/* Call-to-Action Buttons */}
                  {hasButtons && (
                    <div className="w-full max-w-[90%] flex flex-col gap-px mt-px">
                      {buttons.map((btn, idx) => (
                        <div
                          key={idx}
                          className="bg-[#DCF8C6] text-[#0070BA] text-xs font-medium py-2 px-3 flex items-center justify-center border-t border-[#c5e5b3] shadow-sm"
                          style={{
                            borderRadius: idx === buttons.length - 1 ? '0 0 12px 12px' : '0',
                          }}
                        >
                          {getButtonIcon(btn.type)}
                          <span>{btn.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* List Picker Button */}
                  {hasList && (
                    <div className="w-full max-w-[90%] mt-px">
                      <div className="bg-[#DCF8C6] text-[#0070BA] text-xs font-semibold py-2 px-3 flex items-center justify-center gap-1.5 rounded-b-xl border-t border-[#c5e5b3] shadow-sm">
                        <List className="w-3 h-3" />
                        <span>{listButton || 'Ver opções'}</span>
                      </div>
                      {/* List items preview (collapsed style) */}
                      <div className="mt-1.5 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-full">
                        <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
                          <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wide">Opções</p>
                        </div>
                        {listItems.slice(0, 5).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between px-3 py-2 border-b border-gray-50 last:border-0">
                            <div>
                              <p className="text-xs font-medium text-gray-800">{item.item}</p>
                              {item.description && (
                                <p className="text-[9px] text-gray-400">{item.description}</p>
                              )}
                            </div>
                            <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                          </div>
                        ))}
                        {listItems.length > 5 && (
                          <div className="px-3 py-1.5 text-[9px] text-gray-400 italic">
                            + {listItems.length - 5} mais opções
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Empty State */
                <div className="w-full flex items-center justify-center py-8">
                  <div className="bg-white/60 rounded-xl p-4 text-center text-xs text-gray-500 max-w-[85%]">
                    <MessageSquare className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                    <span>Configure o template para visualizar o preview</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-[#F0F0F0] px-3 py-2 flex items-center gap-2">
            <div className="flex-1 bg-white rounded-full px-4 py-2 text-xs text-gray-400">
              Mensagem
            </div>
            <div className="w-8 h-8 rounded-full bg-[#075E54] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Phone Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl"></div>
      </div>

      {/* Template type badge */}
      {templateType && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
            templateType === 'list-picker' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            templateType === 'call-to-action' ? 'bg-blue-50 text-blue-700 border-blue-200' :
            templateType === 'media' ? 'bg-purple-50 text-purple-700 border-purple-200' :
            'bg-gray-50 text-gray-600 border-gray-200'
          }`}>
            {templateType === 'list-picker' ? '📋 Lista' :
             templateType === 'call-to-action' ? '🔗 Botões' :
             templateType === 'media' ? '🖼️ Mídia' :
             '💬 Texto'}
          </span>
        </div>
      )}
    </div>
  );
};
