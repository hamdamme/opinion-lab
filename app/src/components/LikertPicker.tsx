import { LIKERT_LABELS } from "@/types";
import { cn } from "@/lib/utils";

interface LikertPickerProps {
  value: number | null;
  onChange: (v: number) => void;
  disabled?: boolean;
}

const COLORS = [
  "bg-red-500 hover:bg-red-600",
  "bg-orange-500 hover:bg-orange-600",
  "bg-yellow-500 hover:bg-yellow-600",
  "bg-lime-500 hover:bg-lime-600",
  "bg-emerald-500 hover:bg-emerald-600",
];

export function LikertPicker({ value, onChange, disabled }: LikertPickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            disabled={disabled}
            onClick={() => onChange(v)}
            className={cn(
              "h-10 w-10 rounded-full text-sm font-semibold text-white transition-all",
              COLORS[v - 1],
              value === v
                ? "ring-4 ring-primary/40 scale-110"
                : "opacity-40 hover:opacity-90",
              disabled && "cursor-not-allowed opacity-20"
            )}
            title={LIKERT_LABELS[v]}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground px-0.5 w-[216px]">
        <span>Strongly disagree</span>
        <span>Strongly agree</span>
      </div>
    </div>
  );
}
