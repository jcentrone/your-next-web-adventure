import { useEffect, useRef } from "react";

type Options<T> = {
  value: T;
  onSave: (value: T) => void;
  delay?: number;
};

export function useAutosave<T>({ value, onSave, delay = 800 }: Options<T>) {
  const timeoutRef = useRef<number | null>(null);
  const latest = useRef(value);

  useEffect(() => {
    latest.current = value;
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => onSave(latest.current), delay);
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [value, onSave, delay]);
}
