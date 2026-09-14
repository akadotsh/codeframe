import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Popover } from "radix-ui";
import { syntaxThemes, type SyntaxTheme } from "../config/themes";

type SyntaxThemeSelectProps = {
  value: SyntaxTheme;
  onChange: (value: SyntaxTheme) => void;
  onPreview: (value: SyntaxTheme | null) => void;
};

export function SyntaxThemeSelect({ value, onChange, onPreview }: SyntaxThemeSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedTheme = syntaxThemes.find((theme) => theme.value === value)!;
  const filteredThemes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return syntaxThemes;
    return syntaxThemes.filter((theme) =>
      theme.label.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  const changeOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setQuery("");
      onPreview(null);
    }
  };

  const selectTheme = (theme: SyntaxTheme) => {
    onChange(theme);
    changeOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={changeOpen}>
      <Popover.Trigger asChild>
        <button
          id="theme-select"
          className="select-trigger theme-select-trigger"
          role="combobox"
          aria-expanded={open}
          aria-controls="theme-options"
        >
          <span>{selectedTheme.label}</span>
          <ChevronDown aria-hidden="true" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="theme-select-content"
          align="start"
          sideOffset={6}
          onPointerLeave={() => onPreview(null)}
        >
          <div className="theme-search">
            <Search aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search themes…"
              aria-label="Search syntax themes"
            />
          </div>
          <div className="theme-options" id="theme-options" role="listbox">
            {filteredThemes.map((theme) => (
              <button
                key={theme.value}
                className="theme-option"
                role="option"
                aria-selected={theme.value === value}
                onPointerEnter={() => onPreview(theme.value)}
                onFocus={() => onPreview(theme.value)}
                onClick={() => selectTheme(theme.value)}
              >
                <span>{theme.label}</span>
                {theme.value === value && <Check aria-hidden="true" />}
              </button>
            ))}
            {filteredThemes.length === 0 && <p className="theme-empty">No themes found.</p>}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
