import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Popover } from "radix-ui";

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
          id={id}
          className="select-trigger searchable-select-trigger"
          role="combobox"
          aria-expanded={open}
          aria-controls={optionsId}
        >
          <span>{selectedOption.label}</span>
          <ChevronDown aria-hidden="true" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="searchable-select-content"
          align="start"
          sideOffset={6}
          onPointerLeave={() => onPreview?.(null)}
        >
          <div className="select-search">
            <Search aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchLabel}
            />
          </div>
          <div className="select-options" id={optionsId} role="listbox">
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                className="select-option"
                role="option"
                aria-selected={option.value === value}
                onPointerEnter={() => onPreview?.(option.value)}
                onFocus={() => onPreview?.(option.value)}
                onClick={() => selectOption(option.value)}
              >
                <span>{option.label}</span>
                {option.value === value && <Check aria-hidden="true" />}
              </button>
            ))}
            {filteredOptions.length === 0 && <p className="select-empty">No results found.</p>}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
