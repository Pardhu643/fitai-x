import { useEffect, useState, FormEvent } from 'react';
import { goalsService } from '../../services/goals.service';
import { Card } from '../../components/ui/Card';
import { Target, Trash2, Plus, Loader2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    targetWeightKg: '',
    targetBodyFat: '',
    targetDate: ''
  });

  const fetchGoals = async () => {
    try {
      const data = await goalsService.getGoals();
      setGoals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await goalsService.createGoal(formData);
      setFormData({ targetWeightKg: '', targetBodyFat: '', targetDate: '' });
      setShowForm(false);
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await goalsService.deleteGoal(id);
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAchieved = async (goal: any) => {
    try {
      await goalsService.updateGoal(goal.id, { isAchieved: !goal.isAchieved });
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container-custom py-8 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#151B24] border border-white/5 flex items-center justify-center text-[#FFC400]">
            <Target size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Fitness Goals</h1>
            <p className="text-sm text-[#A8B0BF]">Track your fitness targets and achievements.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-[#FFC400] text-black px-4 py-2 rounded-xl font-bold hover:bg-[#FFD43B] transition flex items-center gap-2"
        >
          <Plus size={18} /> Add Goal
        </button>
      </div>

      {showForm && (
        <Card className="bg-[#10151D] border-white/5 p-6 mb-8">
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#A8B0BF] mb-2">Target Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.targetWeightKg}
                onChange={(e) => setFormData({ ...formData, targetWeightKg: e.target.value })}
                placeholder="e.g. 75"
                className="w-full bg-[#171D26] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFC400]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#A8B0BF] mb-2">Target Body Fat (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.targetBodyFat}
                onChange={(e) => setFormData({ ...formData, targetBodyFat: e.target.value })}
                placeholder="e.g. 15"
                className="w-full bg-[#171D26] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFC400]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#A8B0BF] mb-2">Target Date</label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full bg-[#171D26] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFC400]/50 transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <button 
                type="submit"
                className="bg-[#FFC400] text-black px-6 py-3 rounded-xl font-bold hover:bg-[#FFD43B] transition"
              >
                Save Goal
              </button>
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-[#171D26] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#202835] transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-[#FFC400]" size={32} />
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center p-12 text-[#A8B0BF]">
          <p>No goals set yet. Add your first fitness goal above!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => (
            <Card key={goal.id} className={`bg-[#151B24] border-white/5 p-4 flex items-start justify-between gap-4 group ${goal.isAchieved ? 'opacity-60' : ''}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {goal.isAchieved && <CheckCircle size={18} className="text-green-500" />}
                  <h3 className="text-base font-bold text-white">
                    {goal.targetWeightKg && `Target Weight: ${goal.targetWeightKg} kg`}
                    {goal.targetBodyFat && (goal.targetWeightKg ? ' | ' : '')}
                    {goal.targetBodyFat && `Body Fat: ${goal.targetBodyFat}%`}
                  </h3>
                </div>
                {goal.targetDate && (
                  <p className="text-xs text-[#A8B0BF]">Target Date: {format(new Date(goal.targetDate), 'MMM d, yyyy')}</p>
                )}
                <p className="text-xs text-[#A8B0BF] mt-1">Created: {format(new Date(goal.createdAt), 'MMM d, yyyy')}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleToggleAchieved(goal)}
                  className="text-gray-500 hover:text-green-400 transition p-2"
                  title={goal.isAchieved ? 'Mark as not achieved' : 'Mark as achieved'}
                >
                  <CheckCircle size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(goal.id)}
                  className="text-[#FF5E5E] opacity-0 group-hover:opacity-100 p-2 hover:bg-[#FF5E5E]/10 rounded-lg transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
