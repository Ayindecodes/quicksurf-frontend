"use client";

import { useApi } from "@/hooks/useApi";
import { TextField } from "@/components/ui/Field";
import { savedNumbers } from "@/lib/endpoints";

export type SaveChoice = { save: boolean; name: string };

/** "Save this number" checkbox, hidden when the number is already saved. */
export function SaveNumberOption({ phone, value, onChange }: { phone: string; value: SaveChoice; onChange: (v: SaveChoice) => void }) {
  const saved = useApi("saved-numbers", savedNumbers.list);
  if (!phone || !saved.data || saved.data.some((entry) => entry.phone === phone)) return null;
  return (
    <div className="space-y-3 rounded-xl border border-black/5 bg-brand-porcelain p-3.5">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value.save}
          onChange={(e) => onChange({ ...value, save: e.target.checked })}
          className="h-4 w-4 accent-brand-harbor"
        />
        Save this number for next time
      </label>
      {value.save && (
        <TextField
          label="Name"
          placeholder="e.g. Mum"
          maxLength={60}
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
        />
      )}
    </div>
  );
}
