import { Card } from '../ui/Card';
import { Lightbulb, ArrowRight } from 'lucide-react';

interface GeneralCardProps {
  title: string;
  explanation: string;
  data?: {
    tip?: string;
    insight?: string;
    category?: string;
  };
  onAction?: () => void;
  actionLabel?: string;
}

export function GeneralCard({ title, explanation, data, onAction, actionLabel }: GeneralCardProps) {
  return (
    <Card className="bg-[#151B24] border-white/5 p-5 rounded-xl">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="text-[#6366F1]" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold text-white mb-1">{title}</h4>
          <p className="text-sm text-[#A8B0BF] leading-relaxed">{explanation}</p>
        </div>
      </div>

      {data && (
        <div className="bg-[#10151D] rounded-lg p-4 mb-3 space-y-2">
          {data.tip && (
            <div className="flex items-start gap-2">
              <Lightbulb className="text-[#FFC400] mt-0.5 flex-shrink-0" size={14} />
              <span className="text-sm text-white">{data.tip}</span>
            </div>
          )}
          {data.insight && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <span className="text-xs text-[#A8B0BF] block mb-1">Insight:</span>
              <span className="text-sm text-white">{data.insight}</span>
            </div>
          )}
          {data.category && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A8B0BF] w-20">Category:</span>
              <span className="text-xs bg-[#171D26] text-[#A8B0BF] px-2 py-0.5 rounded">{data.category}</span>
            </div>
          )}
        </div>
      )}

      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="w-full bg-[#6366F1] text-white px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-[#7577F5] transition-colors flex items-center justify-center gap-2"
        >
          {actionLabel}
          <ArrowRight size={16} />
        </button>
      )}
    </Card>
  );
}
