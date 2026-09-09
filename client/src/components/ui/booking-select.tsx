/**
 * BookingSelect — a GamersNest-themed dropdown built on Radix Select.
 *
 * Why Radix instead of a native <select>:
 *  - Native <option> menus can't be reliably themed (the OS renders them, which
 *    on this dark UI produced unreadable light-on-light options).
 *  - The app shell uses `overflow: clip`, which can clip natively-positioned
 *    popups. Radix renders the menu in a portal at the body level, so it is
 *    never clipped and always stacks above surrounding elements.
 *  - Full keyboard + touch support out of the box.
 *
 * Styling is via plain CSS classes (see index.css `.gn-select-*`) so it matches
 * the rest of the form, which is CSS-driven rather than Tailwind-driven.
 */
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

export interface BookingSelectOption {
  value: string;
  label: string;
}

interface BookingSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: BookingSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
  id?: string;
}

export function BookingSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  disabled = false,
  ariaLabel,
  id,
}: BookingSelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger className="gn-select-trigger" aria-label={ariaLabel} id={id}>
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon className="gn-select-icon">
          <ChevronDown size={16} strokeWidth={2} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="gn-select-content"
          position="popper"
          sideOffset={6}
        >
          <SelectPrimitive.Viewport className="gn-select-viewport">
            {options.map((option) => (
              <SelectPrimitive.Item key={option.value} value={option.value} className="gn-select-item">
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="gn-select-indicator">
                  <Check size={15} strokeWidth={2.5} />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
