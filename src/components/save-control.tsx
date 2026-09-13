import { Check, ChevronDown } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { Button } from "@/components/ui/button";
import { imageFormats, type ImageFormat } from "../config/export";

export function SaveControl({
  format,
  saved,
  onFormatChange,
  onSave,
}: {
  format: ImageFormat;
  saved: boolean;
  onFormatChange: (format: ImageFormat) => void;
  onSave: (format: ImageFormat) => void;
}) {
  const selectedFormat = imageFormats.find((option) => option.value === format)!;

  return (
    <div className="save-control">
      <Button className="save-button" onClick={() => onSave(format)} aria-live="polite">
        {saved ? "Saved" : `Save ${selectedFormat.label}`}
      </Button>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="save-menu-trigger" aria-label="Choose image format">
            <ChevronDown />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="save-menu-content" align="end" sideOffset={6}>
            <DropdownMenu.RadioGroup
              value={format}
              onValueChange={(next) => onFormatChange(next as ImageFormat)}
            >
              {imageFormats.map((option) => (
                <DropdownMenu.RadioItem
                  className="save-menu-item"
                  key={option.value}
                  value={option.value}
                >
                  <span>{option.label}</span>
                  <small>.{option.extension}</small>
                  <DropdownMenu.ItemIndicator>
                    <Check />
                  </DropdownMenu.ItemIndicator>
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
