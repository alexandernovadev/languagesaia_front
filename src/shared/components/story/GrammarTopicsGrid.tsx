import { Label } from "@/shared/components/ui/label";
import { cn } from "@/utils/common/classnames";
import { GrammarTopicOption } from "@/types/business";

interface GrammarTopicsGridProps {
  topics: GrammarTopicOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  maxSelections?: number;
}

export function GrammarTopicsGrid({
  topics,
  selected,
  onChange,
  maxSelections = 5,
}: GrammarTopicsGridProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      if (selected.length >= maxSelections) return;
      onChange([...selected, value]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Target grammar</Label>
        <span className="text-xs text-muted-foreground">
          {selected.length}/{maxSelections} selected
        </span>
      </div>
      <div className="max-h-[280px] overflow-y-auto rounded-md border p-3 space-y-3">
        {topics.map((category) => (
          <div key={category.value}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              {category.label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {category.children.map((topic) => {
                const isSelected = selected.includes(topic.value);
                const isDisabled = !isSelected && selected.length >= maxSelections;
                return (
                  <button
                    key={topic.value}
                    type="button"
                    onClick={() => toggle(topic.value)}
                    disabled={isDisabled}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs border transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : isDisabled
                        ? "opacity-40 cursor-not-allowed bg-muted"
                        : "bg-muted hover:bg-primary/10 hover:border-primary/50"
                    )}
                  >
                    {topic.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
