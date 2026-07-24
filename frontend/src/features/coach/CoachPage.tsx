import { useState, useEffect, useRef } from 'react';
import { coachService, ChatMessage } from '../../services/coach.service';
import { Card } from '../../components/ui/Card';
import { Send, Bot, User, Sparkles } from 'lucide-react';

export function CoachPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await coachService.chat(input, messages);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data?.reply || 'Error from Rachel' }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting right now.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-custom py-8 max-w-4xl h-[calc(100vh-6rem)] flex flex-col">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#FFC400] flex items-center justify-center text-black">
          <Bot size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Coach Rachel</h1>
          <p className="text-sm text-[#A8B0BF]">Your personal fitness and nutrition guide</p>
        </div>
      </div>
      
      <Card className="flex-1 flex flex-col overflow-hidden bg-[#10151D] border-white/5">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-[#A8B0BF]">
              <Sparkles className="text-[#FFC400] w-12 h-12 mb-2 opacity-50" />
              <p>Hi! I'm Rachel. How can I help you crush your goals today?</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                <button onClick={() => setInput("What should I eat before my workout?")} className="bg-[#171D26] hover:bg-white/10 px-4 py-2 rounded-full text-xs text-white transition">What should I eat before my workout?</button>
                <button onClick={() => setInput("My legs are sore. Any recovery tips?")} className="bg-[#171D26] hover:bg-white/10 px-4 py-2 rounded-full text-xs text-white transition">My legs are sore. Any recovery tips?</button>
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#FFC400] flex-shrink-0 flex items-center justify-center text-black">
                  <Bot size={16} />
                </div>
              )}
              <div className={`p-3 rounded-2xl max-w-[75%] ${msg.role === 'user' ? 'bg-[#FFC400] text-black rounded-tr-sm' : 'bg-[#151B24] text-white rounded-tl-sm'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#32D5F4] flex-shrink-0 flex items-center justify-center text-black">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-[#FFC400] flex-shrink-0 flex items-center justify-center text-black">
                <Bot size={16} />
              </div>
              <div className="bg-[#151B24] p-3 rounded-2xl rounded-tl-sm text-white">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#FFC400] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#FFC400] rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-[#FFC400] rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t border-white/5 bg-[#10151D]">
          <div className="flex gap-2 items-center bg-[#171D26] rounded-xl p-2 border border-white/5 focus-within:border-white/20 transition-colors">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask Rachel anything..."
              className="flex-1 bg-transparent border-none focus:outline-none text-white px-2 placeholder-[#A8B0BF]"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-[#FFC400] text-black p-2 rounded-lg disabled:opacity-50 hover:bg-[#FFD43B] transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
