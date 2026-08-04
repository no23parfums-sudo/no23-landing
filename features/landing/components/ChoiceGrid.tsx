"use client";

import { useState } from "react";

const CHOICES = ["Presencia", "Calma", "Intriga", "Frescura"] as const;

export function ChoiceGrid() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="choice-grid">
      {CHOICES.map((choice) => (
        <button
          key={choice}
          type="button"
          className={selected === choice ? "is-selected" : undefined}
          onClick={() => setSelected(choice)}
        >
          {choice}
        </button>
      ))}
    </div>
  );
}
