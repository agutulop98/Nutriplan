import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react';
import { apiFetch } from '../../lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME: Message = {
  role: 'assistant',
  content: '¡Hola! Soy tu asistente NutriPlan. Puedo ayudarte a buscar recetas, consultar calorías o añadir nuevas recetas. ¿En qué puedo ayudarte?',
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const updated: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const { message } = await apiFetch<{ message: string }>('/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: updated }),
      });
      setMessages(prev => [...prev, { role: 'assistant', content: message ?? 'Sin respuesta.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error. Inténtalo de nuevo.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all"
        aria-label="Abrir asistente"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 h-[480px] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-primary px-4 py-3 flex items-center gap-2 shrink-0">
            <Bot className="w-5 h-5 text-white" />
            <span className="text-white font-medium text-sm">Asistente NutriPlan</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted px-3 py-2 rounded-2xl rounded-bl-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t flex gap-2 shrink-0">
            <input
              ref={inputRef}
              className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Escribe un mensaje..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-primary/90 transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
