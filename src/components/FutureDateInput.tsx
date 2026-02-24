import React from "react";
import { getTodayDate } from "../utils/dateUtils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
};

export default function FutureDateInput({
  value,
  onChange,
  className,
  disabled,
}: Props) {
  return (
    <input
      type="date"
      className={className || "form-control"}
      value={value}
      min={getTodayDate()}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}