import { useEffect, useState, FormEvent } from 'react';
import { habitService } from '../../services/habit.service';
import { Card } from '../../components/ui/Card';
import { Target, CheckCircle2, Circle, Flame, Plus, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export function HabitsPage() {
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim() || submitting) return;
    setSubmitting(true);
    try {
      await habitService.createHabit(newHabitName, 'daily');
      setNewHabitName('');
      setShowAdd(false);
      fetchHabits();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
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
              disabled={submitting}
              placeholder="E.g., Drink 2L water"
              className="flex-1 bg-[#171D26] border border-white/5 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FFC400]/50 transition-colors disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={submitting}
              className="bg-[#7CFF4D] text-black px-4 py-2 rounded-xl font-bold disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
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
