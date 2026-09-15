import { Slider } from "@/components/ui/slider";
import * as stylex from "@stylexjs/stylex";
import { appearanceStyles } from "../styles/appearance.stylex";

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
    <div {...stylex.props(appearanceStyles.group)}>
      <div {...stylex.props(appearanceStyles.label)}>
        <span>{label}</span>
        <output {...stylex.props(appearanceStyles.labelValue)}>
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
