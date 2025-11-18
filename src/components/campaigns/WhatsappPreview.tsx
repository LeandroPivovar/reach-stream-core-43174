import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WhatsappPreviewProps {
  content: string;
  media: { url: string; type: 'image' | 'video'; name: string }[];
}

export const WhatsappPreview: React.FC<WhatsappPreviewProps> = ({ content, media }) => {
  const now = new Date();
  
  return (
    <div className="hidden lg:flex flex-col items-center justify-center flex-shrink-0 w-[320px]">
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
          <div className="flex-1 p-4 overflow-y-auto bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0icGF0dGVybiIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPjxwYXRoIGQ9Ik0wIDBoMTAwdjEwMEgweiIgZmlsbD0iI0VDRTVERCIvPjxwYXRoIGQ9Ik0wIDBoMTAwdjEwMEgweiIgZmlsbC1vcGFjaXR5PSIuMDUiIGZpbGw9IiM0NTRGNUEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybikiLz48L3N2Zz4=')]">
            <div className="flex flex-col items-end">
              {/* Message Bubble */}
              {(content || media.length > 0) && (
                <div className="bg-[#DCF8C6] rounded-lg p-3 max-w-[85%] shadow-sm mb-2">
                  {/* Media */}
                  {media.length > 0 && (
                    <div className="mb-2 space-y-2">
                      {media.map((item, index) => (
                        <div key={index} className="rounded overflow-hidden">
                          {item.type === 'image' ? (
                            <img 
                              src={item.url} 
                              alt={item.name} 
                              className="w-full h-auto max-h-[200px] object-cover"
                            />
                          ) : (
                            <video 
                              src={item.url} 
                              className="w-full h-auto max-h-[200px] object-cover"
                              controls
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Text Content */}
                  {content && (
                    <div className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                      {content}
                    </div>
                  )}
                  
                  {/* Timestamp */}
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[10px] text-gray-600">
                      {formatDistanceToNow(now, { locale: ptBR, addSuffix: true })}
                    </span>
                    <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                      <path d="M11.071 0.929L6 6l-1.071-1.071-1.414 1.414L6 8.828l6.485-6.485L11.071.929z" fill="#4FC3F7"/>
                      <path d="M15.071 0.929L10 6l-1.071-1.071-1.414 1.414L10 8.828l6.485-6.485L15.071.929z" fill="#4FC3F7"/>
                    </svg>
                  </div>
                </div>
              )}
              
              {/* Empty State */}
              {!content && media.length === 0 && (
                <div className="bg-white/50 rounded-lg p-4 text-center text-xs text-gray-500">
                  Digite uma mensagem para visualizar o preview
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Phone Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl"></div>
      </div>
    </div>
  );
};
