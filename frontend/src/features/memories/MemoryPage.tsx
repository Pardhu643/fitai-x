import { useEffect, useState, FormEvent } from 'react';
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

  const handleAdd = async (e: FormEvent) => {
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
