import { useEffect, useState, FormEvent } from 'react';
import { habitService } from '../../services/habit.service';
import { Card } from '../../components/ui/Card';
import { Target, CheckCircle2, Circle, Flame, Plus, Loader2, X, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export function HabitsPage() {
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('WATER');
  const [targetValue, setTargetValue] = useState(1);
  const [unit, setUnit] = useState('times');
  const [frequency, setFrequency] = useState('DAILY');

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
    if (currentCompleted) return;
    try {
      setHabits(prev => prev.map(h => h._id === id || h.id === id ? { ...h, completedToday: true, streak: h.streak + 1 } : h));
      await habitService.completeHabit(id);
      fetchHabits();
    } catch (err) {
      console.error(err);
      fetchHabits();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await habitService.deleteHabit(id);
      fetchHabits();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      await habitService.createHabit({
        name,
        description,
        category,
        targetValue: Number(targetValue),
        unit,
        frequency
      });
      // Clear form
      setName('');
      setDescription('');
      setCategory('WATER');
      setTargetValue(1);
      setUnit('times');
      setFrequency('DAILY');
      setShowAddModal(false);
      fetchHabits();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Unable to create this habit.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#151B24] border border-white/5 flex items-center justify-center text-[#7CFF4D]">
            <Target size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Smart Habits</h1>
            <p className="text-sm text-[#A8B0BF]">Build consistent routines and track your daily progress.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#FFC400] text-black px-5 py-2.5 rounded-xl font-bold hover:bg-[#FFD43B] transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#FFC400]/10 w-full sm:w-auto"
        >
          <Plus size={18} /> Add Habit
        </button>
      </div>

      {/* Habits List */}
      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#FFC400]" size={32} /></div>
      ) : habits.length === 0 ? (
        <div className="text-center p-12 text-[#A8B0BF] bg-[#10151D] border border-white/5 rounded-2xl">
          No habits set yet. Start building good routines!
        </div>
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
                  <p className="text-xs text-[#A8B0BF] capitalize">{habit.type || habit.category || 'Daily'} Habit</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-[#151B24] px-3 py-1.5 rounded-lg border border-white/5">
                  <Flame size={16} className={habit.streak > 0 ? "text-[#FFC400]" : "text-[#A8B0BF]"} />
                  <span className="text-sm font-bold text-white">{habit.streak || 0} Streak</span>
                </div>
                <button 
                  onClick={() => handleDelete(habit._id || habit.id)}
                  className="p-2 text-[#6F7887] hover:text-[#FF5E5E] transition opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-[#10151D] border border-white/5 max-w-md w-full p-6 relative rounded-2xl shadow-2xl">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-[#A8B0BF] hover:text-white transition"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-white mb-4">Add New Habit</h2>
            {errorMsg && <p className="text-xs text-[#FF5E5E] mb-3 bg-[#FF5E5E]/10 p-2.5 rounded-lg">{errorMsg}</p>}
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#A8B0BF] uppercase tracking-wide mb-1.5">Habit Name</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="E.g., Drink 2L Water"
                  className="w-full bg-[#171D26] border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FFC400]/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A8B0BF] uppercase tracking-wide mb-1.5">Description</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Why is this habit important?"
                  className="w-full bg-[#171D26] border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FFC400]/50 transition-colors h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#A8B0BF] uppercase tracking-wide mb-1.5">Category</label>
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-[#171D26] border border-white/5 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#FFC400]/50 text-xs font-bold"
                  >
                    <option value="WATER">Water</option>
                    <option value="SLEEP">Sleep</option>
                    <option value="STEPS">Steps</option>
                    <option value="WORKOUT">Workout</option>
                    <option value="STRETCHING">Stretching</option>
                    <option value="MEDITATION">Meditation</option>
                    <option value="NUTRITION">Nutrition</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#A8B0BF] uppercase tracking-wide mb-1.5">Frequency</label>
                  <select 
                    value={frequency}
                    onChange={e => setFrequency(e.target.value)}
                    className="w-full bg-[#171D26] border border-white/5 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#FFC400]/50 text-xs font-bold"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#A8B0BF] uppercase tracking-wide mb-1.5">Target Value</label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={targetValue}
                    onChange={e => setTargetValue(Number(e.target.value))}
                    className="w-full bg-[#171D26] border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FFC400]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#A8B0BF] uppercase tracking-wide mb-1.5">Unit</label>
                  <input 
                    type="text"
                    required
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    placeholder="e.g., glasses, mins"
                    className="w-full bg-[#171D26] border border-white/5 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FFC400]/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-white/5 hover:bg-[#151B24] transition text-gray-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="bg-[#FFC400] text-black px-5 py-2 rounded-xl font-bold hover:bg-[#FFD43B] transition text-xs disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Habit'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
