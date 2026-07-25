import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { groceryService, GroceryList, GroceryItem } from '../../services/grocery.service';
import { ShoppingCart, Trash2, Plus, Check, Square, Loader, RefreshCw } from 'lucide-react';

export function GroceryListPage() {
  const [list, setList] = useState<GroceryList | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState(false);

  // Form for custom item addition
  const [customName, setCustomName] = useState('');
  const [customQty, setCustomQty] = useState(1);
  const [customUnit, setCustomUnit] = useState('g');
  const [customCategory, setCustomCategory] = useState('other');

  const loadList = async () => {
    try {
      setLoading(true);
      const active = await groceryService.getCurrentList();
      setList(active);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  const handleGenerate = async () => {
    setActionPending(true);
    try {
      const newList = await groceryService.generateList();
      setList(newList);
    } catch (err) {
      console.error(err);
    } finally {
      setActionPending(false);
    }
  };

  const handleRegenerate = async () => {
    if (!list) return;
    if (!window.confirm('Are you sure you want to regenerate the checklist? Manually added custom items will be preserved.')) return;
    setActionPending(true);
    try {
      const regenerated = await groceryService.regenerateList(list.id);
      setList(regenerated);
    } catch (err) {
      console.error(err);
    } finally {
      setActionPending(false);
    }
  };

  const handleToggleItem = async (itemId: string) => {
    try {
      // Optimistic state toggle update
      if (list) {
        const updatedItems = list.items.map(item => 
          item.id === itemId ? { ...item, checked: !item.checked } : item
        );
        const comp = updatedItems.filter(i => i.checked).length;
        setList({
          ...list,
          items: updatedItems,
          completedCount: comp,
          remainingCount: updatedItems.length - comp
        });
      }
      await groceryService.toggleItem(itemId);
    } catch (err) {
      console.error(err);
      loadList(); // rollback
    }
  };

  const handleAddCustomItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!list || !customName) return;
    setActionPending(true);
    try {
      const updatedList = await groceryService.addCustomItem(list.id, {
        name: customName,
        quantity: customQty,
        unit: customUnit,
        category: customCategory
      });
      setList(updatedList);
      setCustomName('');
      setCustomQty(1);
    } catch (err) {
      console.error(err);
    } finally {
      setActionPending(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Remove this item from the list?')) return;
    try {
      const updated = await groceryService.deleteItem(itemId);
      setList(updated);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader className="animate-spin text-[#FFC400]" size={36} />
        <p className="text-gray-400 text-sm">Assembling your grocery list...</p>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-[#10151D] border border-white/5 p-8 rounded-3xl space-y-6 shadow-xl">
          <ShoppingCart size={48} className="text-[#FFC400] mx-auto" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">No Active Grocery List</h2>
          <p className="text-[#A8B0BF] text-xs">
            Generate an automated grocery list from your active meal plan schedule to purchase raw ingredients.
          </p>
          <button 
            onClick={handleGenerate}
            disabled={actionPending}
            className="bg-[#FFC400] hover:bg-[#FFD43B] text-black px-6 py-2.5 rounded-xl font-bold text-xs transition disabled:opacity-50"
          >
            {actionPending ? 'Generating...' : 'Generate Grocery List'}
          </button>
        </div>
      </div>
    );
  }

  // Group items by category
  const categoriesMap: { [key: string]: GroceryItem[] } = {};
  list.items.forEach(item => {
    const cat = item.category || 'other';
    if (!categoriesMap[cat]) {
      categoriesMap[cat] = [];
    }
    categoriesMap[cat].push(item);
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-20">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">GROCERY LIST</h1>
          <p className="text-[#A8B0BF] text-sm mt-1">Checklist progress: {list.completedCount} / {list.totalCount} items purchased</p>
        </div>
        <button 
          onClick={handleRegenerate}
          disabled={actionPending}
          className="flex items-center gap-2 border border-white/5 bg-[#10151D] hover:bg-[#151B24] transition px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 disabled:opacity-50 self-start"
        >
          <RefreshCw size={16} className={actionPending ? "animate-spin text-white" : "text-[#FFC400]"} />
          Regenerate Checklist
        </button>
      </div>

      {/* Grid: Items by Category + Custom Item Input form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Checkbox item categories */}
        <div className="lg:col-span-2 space-y-6">
          {Object.keys(categoriesMap).length === 0 ? (
            <div className="bg-[#10151D]/50 border border-dashed border-white/5 rounded-2xl p-8 text-center text-gray-500 text-xs">
              Checklist contains no items. Add custom items below to begin tracking.
            </div>
          ) : (
            Object.entries(categoriesMap).map(([category, items]) => (
              <div key={category} className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#A8B0BF] pl-1">{category}</h3>
                
                <Card className="bg-[#10151D] border border-white/5 divide-y divide-white/5 overflow-hidden">
                  {items.map(item => (
                    <div 
                      key={item.id} 
                      className={`flex items-center justify-between px-4 py-3.5 transition ${
                        item.checked ? 'bg-[#151B24]/40 opacity-55' : 'hover:bg-[#151B24]/20'
                      }`}
                    >
                      {/* Left: checkbox toggle */}
                      <button 
                        onClick={() => handleToggleItem(item.id)}
                        className="flex items-center gap-3 text-left focus:outline-none flex-1 py-1"
                      >
                        {item.checked ? (
                          <Check size={20} className="text-[#FFC400] shrink-0" />
                        ) : (
                          <Square size={20} className="text-gray-600 shrink-0" />
                        )}
                        <span className={`text-sm font-semibold text-white ${item.checked ? 'line-through text-gray-500' : ''}`}>
                          {item.name}
                        </span>
                      </button>

                      {/* Right: quantity + manual tag + delete */}
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-gray-400 bg-[#171D26] px-2.5 py-1 rounded-lg">
                          {item.quantity} {item.unit}
                        </span>
                        {item.manuallyAdded && (
                          <span className="bg-[#FFC400]/10 text-[#FFC400] text-[8px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase">
                            Custom
                          </span>
                        )}
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-gray-500 hover:text-red-400 transition"
                          aria-label="Delete item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            ))
          )}
        </div>

        {/* Custom Item Insertion form */}
        <div className="lg:col-span-1">
          <Card className="bg-[#10151D] border border-white/5 p-6 space-y-4 sticky top-24">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#A8B0BF]">Add Custom Item</h3>
            
            <form onSubmit={handleAddCustomItem} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#A8B0BF] uppercase tracking-wide mb-1">Item Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Greek Yogurt"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full bg-[#171D26] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFC400]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#A8B0BF] uppercase tracking-wide mb-1">Qty</label>
                  <input 
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    value={customQty}
                    onChange={e => setCustomQty(Number(e.target.value))}
                    className="w-full bg-[#171D26] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#A8B0BF] uppercase tracking-wide mb-1">Unit</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. g, pcs"
                    value={customUnit}
                    onChange={e => setCustomUnit(e.target.value)}
                    className="w-full bg-[#171D26] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#A8B0BF] uppercase tracking-wide mb-1">Category</label>
                <select 
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                  className="w-full bg-[#171D26] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="dairy">Dairy</option>
                  <option value="meat and seafood">Meat & Seafood</option>
                  <option value="grains">Grains</option>
                  <option value="spices and condiments">Spices & Condiments</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={actionPending}
                className="w-full bg-[#FFC400] text-black font-bold py-2.5 rounded-xl hover:bg-[#FFD43B] transition text-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Plus size={16} /> Add to List
              </button>
            </form>
          </Card>
        </div>

      </div>

    </div>
  );
}
export default GroceryListPage;
