import { useEffect, useState } from 'react';
import { calendarService } from '../../services/calendar.service';
import { Card } from '../../components/ui/Card';
import { Calendar as CalendarIcon, Clock, Activity, Plus, Loader2 } from 'lucide-react';
import { format, addDays } from 'date-fns';

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
            <div className={`text-lg font-bold ${i === 0 ? 'text-[#FFC400]' : 'text-white'}`}>{format(day, 'd')}</div>
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
