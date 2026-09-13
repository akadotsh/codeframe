import { Slider } from "@/components/ui/slider";

export function RangeControl({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="setting-group range-control">
      <div className="setting-label">
        <span>{label}</span>
        <output>
          {value}
          {unit}
        </output>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={(next) => onChange(next[0])}
        aria-label={label}
      />
    </div>
  );
}
