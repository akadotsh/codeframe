import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Popover } from "radix-ui";
import * as stylex from "@stylexjs/stylex";

const menuIn = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(-3px) scale(0.98)" },
  to: { opacity: 1, transform: "translateY(0) scale(1)" },
});

const styles = stylex.create({
  trigger: {
    boxSizing: "border-box",
    appearance: "none",
    width: "100%",
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 11px 0 12px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#41434a",
    borderRadius: 7,
    backgroundColor: "#23252a",
    color: "#eeeae0",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.035), 0 8px 22px rgba(0, 0, 0, 0.12)",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 13,
    ":focus-visible": {
      outlineWidth: 2,
      outlineStyle: "solid",
      outlineColor: "#b9bdc7",
      outlineOffset: 3,
    },
  },
  chevron: {
    width: 15,
    color: "#a6a398",
    transition: "transform 160ms cubic-bezier(0.23, 1, 0.32, 1)",
  },
  chevronOpen: { transform: "rotate(180deg)" },
  menu: {
    boxSizing: "border-box",
    zIndex: 50,
    width: "var(--radix-popover-trigger-width)",
    padding: 6,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#3b3d45",
    borderRadius: 8,
    backgroundColor: "#1c1e23",
    color: "#f0eee7",
    boxShadow: "0 18px 48px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.045)",
    backdropFilter: "blur(18px)",
    transformOrigin: "var(--radix-popover-content-transform-origin)",
    animationName: menuIn,
    animationDuration: "150ms",
    animationTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
    "@media (prefers-reduced-motion: reduce)": {
      transform: "none",
      transition: "opacity 160ms ease",
    },
  },
  search: {
    boxSizing: "border-box",
    height: 34,
    display: "flex",
    alignItems: "center",
    gap: 7,
    paddingInline: 9,
    marginBottom: 5,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#34363e",
    borderRadius: 7,
    backgroundColor: "#16171c",
  },
  searchIcon: { width: 14, flexShrink: 0, color: "#a6a398" },
  input: {
    width: "100%",
    minWidth: 0,
    borderWidth: 0,
    outline: "none",
    backgroundColor: "transparent",
    color: "#f0eee7",
    fontFamily: "inherit",
    fontSize: 12,
    "::placeholder": { color: "#a6a398" },
  },
  options: { maxHeight: 264, overflowY: "auto" },
  option: {
    appearance: "none",
    width: "100%",
    height: 34,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingInline: 9,
    borderWidth: 0,
    borderRadius: 4,
    backgroundColor: "transparent",
    color: "#c2bfb4",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 12,
    textAlign: "left",
    transition: "color 120ms ease, background-color 120ms ease",
    ":hover": { backgroundColor: "#2c2e34", color: "#f3f1e9" },
    ":focus-visible": {
      outline: "none",
      backgroundColor: "#2c2e34",
      color: "#f3f1e9",
    },
  },
  check: { width: 14, flexShrink: 0 },
  empty: { margin: 0, padding: "12px 9px", color: "#a6a398", fontSize: 12, textAlign: "center" },
});

type SelectOption<Value extends string> = {
  label: string;
  value: Value;
};

type SearchableSelectProps<Value extends string> = {
  id: string;
  options: readonly SelectOption<Value>[];
  searchLabel: string;
  searchPlaceholder: string;
  value: Value;
  onChange: (value: Value) => void;
  onPreview?: (value: Value | null) => void;
};

export function SearchableSelect<Value extends string>({
  id,
  options,
  searchLabel,
  searchPlaceholder,
  value,
  onChange,
  onPreview,
}: SearchableSelectProps<Value>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedOption = options.find((option) => option.value === value)!;
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return options;
    return options.filter((option) => option.label.toLocaleLowerCase().includes(normalizedQuery));
  }, [options, query]);
  const optionsId = `${id}-options`;

  const changeOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setQuery("");
      onPreview?.(null);
    }
  };

  const selectOption = (nextValue: Value) => {
    onChange(nextValue);
    changeOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={changeOpen}>
      <Popover.Trigger asChild>
        <button
          {...stylex.props(styles.trigger)}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={optionsId}
        >
          <span>{selectedOption.label}</span>
          <ChevronDown
            {...stylex.props(styles.chevron, open && styles.chevronOpen)}
            aria-hidden="true"
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          {...stylex.props(styles.menu)}
          align="start"
          sideOffset={6}
          onPointerLeave={() => onPreview?.(null)}
        >
          <div {...stylex.props(styles.search)}>
            <Search {...stylex.props(styles.searchIcon)} aria-hidden="true" />
            <input
              {...stylex.props(styles.input)}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchLabel}
            />
          </div>
          <div {...stylex.props(styles.options)} id={optionsId} role="listbox">
            {filteredOptions.map((option) => (
              <button
                {...stylex.props(styles.option)}
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                onPointerEnter={() => onPreview?.(option.value)}
                onFocus={() => onPreview?.(option.value)}
                onClick={() => selectOption(option.value)}
              >
                <span>{option.label}</span>
                {option.value === value && (
                  <Check {...stylex.props(styles.check)} aria-hidden="true" />
                )}
              </button>
            ))}
            {filteredOptions.length === 0 && (
              <p {...stylex.props(styles.empty)}>No results found.</p>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
