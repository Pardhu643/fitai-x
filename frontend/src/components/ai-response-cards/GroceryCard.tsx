import { useState } from 'react';
import { Card } from '../ui/Card';
import { ShoppingCart, Check, ArrowRight } from 'lucide-react';
import { groceryService } from '../../services/grocery.service';

interface GroceryCardProps {
  title: string;
  explanation: string;
  data?: {
    items?: Array<{ name: string; quantity?: string; category?: string }>;
    totalItems?: number;
  };
  onAction?: () => void;
  actionLabel?: string;
}

export function GroceryCard({ title, explanation, data, onAction }: GroceryCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToGroceryList = async () => {
    if (isAdded || isLoading) return;
    setIsLoading(true);

    try {
      await groceryService.generateList();
      setIsAdded(true);
      if (onAction) onAction();
    } catch (err) {
      console.error('Failed to add grocery list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-[#151B24] border-white/5 p-5 rounded-xl">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#A855F7]/10 flex items-center justify-center flex-shrink-0">
          <ShoppingCart className="text-[#A855F7]" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold text-white mb-1">{title}</h4>
          <p className="text-sm text-[#A8B0BF] leading-relaxed">{explanation}</p>
        </div>
      </div>

      {data && (
        <div className="bg-[#10151D] rounded-lg p-4 mb-3">
          {data.totalItems && (
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
              <Check className="text-[#4ADE80]" size={14} />
              <span className="text-xs text-[#A8B0BF]">Total Items:</span>
              <span className="text-sm text-white font-bold">{data.totalItems}</span>
            </div>
          )}
          {data.items && data.items.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {data.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-white">{item.name}</span>
                  <div className="flex items-center gap-2">
                    {item.quantity && <span className="text-xs text-[#A8B0BF]">{item.quantity}</span>}
                    {item.category && <span className="text-xs bg-[#171D26] text-[#A8B0BF] px-2 py-0.5 rounded">{item.category}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleAddToGroceryList}
        disabled={isAdded || isLoading}
        className={`w-full px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
          isAdded 
            ? 'bg-[#4ADE80] text-black cursor-default' 
            : 'bg-[#A855F7] text-white hover:bg-[#B875FF] disabled:opacity-50'
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
            Add to Grocery List
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </Card>
  );
}
