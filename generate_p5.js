const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

const files = {
  'services/coach.service.ts': `import api from '../lib/api';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
}

export const coachService = {
  chat: async (message: string, history: ChatMessage[]) => {
    const response = await api.post('/api/v1/ai-coach/chat', { message, history });
    return response.data;
  },
};
`,
  'services/memory.service.ts': `import api from '../lib/api';

export const memoryService = {
  getMemories: async () => {
    const response = await api.get('/api/v1/memories');
    return response.data.data?.memories || [];
  },
  createMemory: async (content: string) => {
    const response = await api.post('/api/v1/memories', { content });
    return response.data.data?.memory;
  },
  deleteMemory: async (id: string) => {
    const response = await api.delete(\`/api/v1/memories/\${id}\`);
    return response.data;
  }
};
`,
  'services/habit.service.ts': `import api from '../lib/api';

export const habitService = {
  getHabits: async () => {
    const response = await api.get('/api/v1/smart-habits');
    return response.data.data?.habits || [];
  },
  createHabit: async (name: string, type: string) => {
    const response = await api.post('/api/v1/smart-habits', { name, type });
    return response.data.data?.habit;
  },
  updateHabit: async (id: string, data: any) => {
    const response = await api.patch(\`/api/v1/smart-habits/\${id}\`, data);
    return response.data.data?.habit;
  },
  completeHabit: async (id: string) => {
    const response = await api.post(\`/api/v1/smart-habits/\${id}/complete\`);
    return response.data.data?.habit;
  },
  deleteHabit: async (id: string) => {
    const response = await api.delete(\`/api/v1/smart-habits/\${id}\`);
    return response.data;
  }
};
`,
  'services/calendar.service.ts': `import api from '../lib/api';

export const calendarService = {
  getEvents: async (startDate: string, endDate: string) => {
    const response = await api.get(\`/api/v1/smart-calendar?startDate=\${startDate}&endDate=\${endDate}\`);
    return response.data.data?.events || [];
  },
  createEvent: async (data: any) => {
    const response = await api.post('/api/v1/smart-calendar', data);
    return response.data.data?.event;
  },
  updateEvent: async (id: string, data: any) => {
    const response = await api.patch(\`/api/v1/smart-calendar/\${id}\`, data);
    return response.data.data?.event;
  },
  deleteEvent: async (id: string) => {
    const response = await api.delete(\`/api/v1/smart-calendar/\${id}\`);
    return response.data;
  }
};
`,
  'services/notification.service.ts': `import api from '../lib/api';

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/api/v1/notifications');
    return response.data.data?.notifications || [];
  },
  markAsRead: async (id: string) => {
    const response = await api.patch(\`/api/v1/notifications/\${id}/read\`);
    return response.data.data?.notification;
  },
  markAllAsRead: async () => {
    const response = await api.patch('/api/v1/notifications/read-all');
    return response.data;
  }
};
`,
  'features/coach/CoachPage.tsx': `import React, { useState, useEffect, useRef } from 'react';
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
    if (!input.trim()) return;
    
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
            <div key={i} className={\`flex gap-3 \${msg.role === 'user' ? 'justify-end' : 'justify-start'}\`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#FFC400] flex-shrink-0 flex items-center justify-center text-black">
                  <Bot size={16} />
                </div>
              )}
              <div className={\`p-3 rounded-2xl max-w-[75%] \${msg.role === 'user' ? 'bg-[#FFC400] text-black rounded-tr-sm' : 'bg-[#151B24] text-white rounded-tl-sm'}\`}>
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
`,
  'features/memories/MemoryPage.tsx': `import React, { useEffect, useState } from 'react';
import { memoryService } from '../../services/memory.service';
import { Card } from '../../components/ui/Card';
import { Brain, Trash2, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export function MemoryPage() {
  const [memories, setMemories] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMemories = async () => {
    try {
      const data = await memoryService.getMemories();
      setMemories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      await memoryService.createMemory(input);
      setInput('');
      fetchMemories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await memoryService.deleteMemory(id);
      fetchMemories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container-custom py-8 max-w-4xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#151B24] border border-white/5 flex items-center justify-center text-[#FFC400]">
          <Brain size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Memories</h1>
          <p className="text-sm text-[#A8B0BF]">Everything Rachel remembers about your preferences and journey.</p>
        </div>
      </div>

      <Card className="bg-[#10151D] border-white/5 p-6 mb-8">
        <form onSubmit={handleAdd} className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a new fact or preference..."
            className="flex-1 bg-[#171D26] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFC400]/50 transition-colors"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="bg-[#FFC400] text-black px-6 py-3 rounded-xl font-bold hover:bg-[#FFD43B] disabled:opacity-50 transition flex items-center gap-2"
          >
            <Plus size={20} /> Add
          </button>
        </form>
      </Card>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-[#FFC400]" size={32} />
        </div>
      ) : memories.length === 0 ? (
        <div className="text-center p-12 text-[#A8B0BF]">
          <p>No memories yet. Chat with Rachel or add one above!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {memories.map((mem) => (
            <Card key={mem._id || mem.id} className="bg-[#151B24] border-white/5 p-4 flex items-start justify-between gap-4 group">
              <div>
                <p className="text-white text-sm mb-1">{mem.content}</p>
                <span className="text-xs text-[#A8B0BF]">{mem.createdAt ? format(new Date(mem.createdAt), 'MMM d, yyyy h:mm a') : 'Recently'}</span>
              </div>
              <button 
                onClick={() => handleDelete(mem._id || mem.id)}
                className="text-[#FF5E5E] opacity-0 group-hover:opacity-100 p-2 hover:bg-[#FF5E5E]/10 rounded-lg transition"
              >
                <Trash2 size={18} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
`,
  'features/habits/HabitsPage.tsx': `import React, { useEffect, useState } from 'react';
import { habitService } from '../../services/habit.service';
import { Card } from '../../components/ui/Card';
import { Target, CheckCircle2, Circle, Flame, Plus, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export function HabitsPage() {
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  const fetchHabits = async () => {
    try {
      const data = await habitService.getHabits();
      setHabits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleToggle = async (id: string, currentCompleted: boolean) => {
    if (currentCompleted) return; // For simplicity, only complete
    try {
      setHabits(prev => prev.map(h => h._id === id ? { ...h, completedToday: true, streak: h.streak + 1 } : h));
      await habitService.completeHabit(id);
      fetchHabits();
    } catch (err) {
      console.error(err);
      fetchHabits();
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    try {
      await habitService.createHabit(newHabitName, 'daily');
      setNewHabitName('');
      setShowAdd(false);
      fetchHabits();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container-custom py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#151B24] border border-white/5 flex items-center justify-center text-[#7CFF4D]">
            <Target size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Smart Habits</h1>
            <p className="text-sm text-[#A8B0BF]">Track daily goals and build streaks.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-[#FFC400] text-black px-4 py-2 rounded-xl font-bold hover:bg-[#FFD43B] transition flex items-center gap-2"
        >
          <Plus size={18} /> New Habit
        </button>
      </div>

      {showAdd && (
        <Card className="bg-[#151B24] border-white/5 p-4 mb-6">
          <form onSubmit={handleAdd} className="flex gap-4">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="E.g., Drink 2L water"
              className="flex-1 bg-[#171D26] border border-white/5 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FFC400]/50 transition-colors"
            />
            <button type="submit" className="bg-[#7CFF4D] text-black px-4 py-2 rounded-xl font-bold">Save</button>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#FFC400]" size={32} /></div>
      ) : habits.length === 0 ? (
        <div className="text-center p-12 text-[#A8B0BF]">No habits set. Start building good routines!</div>
      ) : (
        <div className="grid gap-4">
          {habits.map(habit => (
            <Card key={habit._id || habit.id} className="bg-[#10151D] border-white/5 p-5 flex items-center justify-between group hover:border-white/10 transition-all">
              <div className="flex items-center gap-4">
                <button onClick={() => handleToggle(habit._id || habit.id, habit.completedToday)}>
                  {habit.completedToday ? (
                    <CheckCircle2 size={28} className="text-[#7CFF4D]" />
                  ) : (
                    <Circle size={28} className="text-[#A8B0BF] hover:text-white transition" />
                  )}
                </button>
                <div>
                  <h3 className={cn("text-lg font-semibold transition-colors", habit.completedToday ? "text-white/50 line-through" : "text-white")}>
                    {habit.name}
                  </h3>
                  <p className="text-xs text-[#A8B0BF] capitalize">{habit.type || 'Daily'} Habit</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-[#151B24] px-3 py-1.5 rounded-lg border border-white/5">
                <Flame size={16} className={habit.streak > 0 ? "text-[#FFC400]" : "text-[#A8B0BF]"} />
                <span className="text-sm font-bold text-white">{habit.streak || 0} Streak</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
`,
  'features/calendar/CalendarPage.tsx': `import React, { useEffect, useState } from 'react';
import { calendarService } from '../../services/calendar.service';
import { Card } from '../../components/ui/Card';
import { Calendar as CalendarIcon, Clock, Activity, AlertCircle, Plus, Loader2 } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';

export function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const start = new Date().toISOString();
      const end = addDays(new Date(), 7).toISOString();
      const data = await calendarService.getEvents(start, end);
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Simple render of next 7 days for demo
  const days = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));

  return (
    <div className="container-custom py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#151B24] border border-white/5 flex items-center justify-center text-[#32D5F4]">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Smart Calendar</h1>
            <p className="text-sm text-[#A8B0BF]">Your upcoming schedule integrated with AI insights.</p>
          </div>
        </div>
        <button className="bg-[#151B24] text-white border border-white/10 px-4 py-2 rounded-xl font-bold hover:bg-white/5 transition flex items-center gap-2">
          <Plus size={18} /> Add Event
        </button>
      </div>

      <div className="grid grid-cols-7 gap-4 mb-6">
        {days.map((day, i) => (
          <div key={i} className="bg-[#10151D] border border-white/5 rounded-xl p-3 text-center">
            <div className="text-xs text-[#A8B0BF] mb-1">{format(day, 'EEE')}</div>
            <div className={\`text-lg font-bold \${i === 0 ? 'text-[#FFC400]' : 'text-white'}\`}>{format(day, 'd')}</div>
          </div>
        ))}
      </div>

      <Card className="bg-[#10151D] border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-[#151B24]">
          <h2 className="text-lg font-bold text-white">Upcoming Events</h2>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#FFC400]" size={32} /></div>
          ) : events.length === 0 ? (
            <div className="text-center p-8 text-[#A8B0BF]">No scheduled events for the upcoming week.</div>
          ) : (
            <div className="space-y-4">
              {events.map((ev) => (
                <div key={ev._id || ev.id} className="flex gap-4 p-4 rounded-xl bg-[#151B24] border border-white/5 hover:border-white/10 transition">
                  <div className="w-16 flex-shrink-0 text-center">
                    <div className="text-sm font-bold text-white">{format(new Date(ev.date), 'h:mm a')}</div>
                    <div className="text-xs text-[#A8B0BF]">{format(new Date(ev.date), 'MMM d')}</div>
                  </div>
                  <div className="w-1 bg-[#FFC400] rounded-full"></div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-white mb-1">{ev.title}</h3>
                    <div className="flex gap-3 text-xs text-[#A8B0BF]">
                      <span className="flex items-center gap-1"><Clock size={12}/> {ev.duration} min</span>
                      <span className="flex items-center gap-1"><Activity size={12}/> {ev.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
`
};

for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(srcDir, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
  console.log('Created:', relPath);
}
