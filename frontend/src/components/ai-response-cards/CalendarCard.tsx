import { useState } from 'react';
import { Card } from '../ui/Card';
import { Calendar, Clock, MapPin, ArrowRight, Check } from 'lucide-react';
import { calendarService } from '../../services/calendar.service';
import { addDays } from 'date-fns';

interface CalendarCardProps {
  title: string;
  explanation: string;
  data?: {
    event?: string;
    date?: string;
    time?: string;
    location?: string;
    type?: string;
  };
  onAction?: () => void;
  actionLabel?: string;
}

export function CalendarCard({ title, explanation, data, onAction }: CalendarCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddEvent = async () => {
    if (isAdded || isLoading) return;
    setIsLoading(true);

    try {
      if (data?.event) {
        const eventDate = data.date === 'Tomorrow' ? addDays(new Date(), 1) : new Date(data.date || new Date());
        const eventTime = data.time || '09:00';
        
        const [hours, minutes] = eventTime.split(':').map(Number);
        const startTime = new Date(eventDate);
        startTime.setHours(hours, minutes, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 1);

        await calendarService.createEvent({
          title: data.event,
          description: explanation,
          type: data.type || 'WORKOUT',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          allDay: false,
          status: 'SCHEDULED'
        });
        setIsAdded(true);
        if (onAction) onAction();
      }
    } catch (err) {
      console.error('Failed to add event:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-[#151B24] border-white/5 p-5 rounded-xl">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#14B8A6]/10 flex items-center justify-center flex-shrink-0">
          <Calendar className="text-[#14B8A6]" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold text-white mb-1">{title}</h4>
          <p className="text-sm text-[#A8B0BF] leading-relaxed">{explanation}</p>
        </div>
      </div>

      {data && (
        <div className="bg-[#10151D] rounded-lg p-4 mb-3 space-y-2">
          {data.event && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A8B0BF] w-20">Event:</span>
              <span className="text-sm text-white font-medium">{data.event}</span>
            </div>
          )}
          {data.date && (
            <div className="flex items-center gap-2">
              <Calendar className="text-[#14B8A6]" size={14} />
              <span className="text-xs text-[#A8B0BF]">Date:</span>
              <span className="text-sm text-white">{data.date}</span>
            </div>
          )}
          {data.time && (
            <div className="flex items-center gap-2">
              <Clock className="text-[#FFC400]" size={14} />
              <span className="text-xs text-[#A8B0BF]">Time:</span>
              <span className="text-sm text-white">{data.time}</span>
            </div>
          )}
          {data.location && (
            <div className="flex items-center gap-2">
              <MapPin className="text-[#FF5E5E]" size={14} />
              <span className="text-xs text-[#A8B0BF]">Location:</span>
              <span className="text-sm text-white">{data.location}</span>
            </div>
          )}
          {data.type && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A8B0BF] w-20">Type:</span>
              <span className="text-xs bg-[#171D26] text-[#A8B0BF] px-2 py-0.5 rounded">{data.type}</span>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleAddEvent}
        disabled={isAdded || isLoading}
        className={`w-full px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
          isAdded 
            ? 'bg-[#4ADE80] text-black cursor-default' 
            : 'bg-[#14B8A6] text-white hover:bg-[#2DD4BF] disabled:opacity-50'
        }`}
      >
        {isAdded ? (
          <>
            <Check size={16} />
            Added ✓
          </>
        ) : isLoading ? (
          'Adding...'
        ) : (
          <>
            Add Event
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </Card>
  );
}
