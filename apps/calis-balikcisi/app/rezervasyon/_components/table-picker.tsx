'use client';

import {
  COAST_TABLES,
  INDOOR_TABLES,
  type Table,
  type TableZone,
} from '../_data';

type Props = {
  selectedId: string | null;
  onSelect: (id: string) => void;
};

const ZONE_LABEL: Record<TableZone, string> = {
  coast: 'Sahil',
  indoor: 'İç Mekan',
};

type ButtonProps = {
  table: Table;
  selected: boolean;
  onSelect: (id: string) => void;
};

function TableButton({ table, selected, onSelect }: ButtonProps) {
  const ariaLabel = `${ZONE_LABEL[table.zone]}, ${table.row}. sıra, ${table.col}. masa`;
  const state = selected
    ? 'bg-accent text-bg border-accent'
    : 'border-fg/30 text-fg/50 hover:border-accent hover:text-accent';
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={ariaLabel}
      onClick={() => onSelect(table.id)}
      className={`h-12 w-12 md:h-14 md:w-14 border rounded-sm text-xs md:text-sm font-body transition-colors flex items-center justify-center ${state}`}
    >
      {table.label}
    </button>
  );
}

export function TablePicker({ selectedId, onSelect }: Props) {
  const selected =
    [...COAST_TABLES, ...INDOOR_TABLES].find((t) => t.id === selectedId) ?? null;

  return (
    <div>
      <p className="text-[10px] md:text-xs uppercase tracking-wider text-fg/60 mb-3">
        Sahil (Deniz Kenarı)
      </p>
      <div className="grid grid-cols-5 gap-2 justify-items-center max-w-xs md:max-w-sm mx-auto md:mx-0">
        {COAST_TABLES.map((table) => (
          <TableButton
            key={table.id}
            table={table}
            selected={table.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>

      <p className="text-[10px] md:text-xs uppercase tracking-wider text-fg/60 mt-6 mb-3">
        İç Mekan
      </p>
      <div className="grid grid-cols-5 gap-2 justify-items-center max-w-xs md:max-w-sm mx-auto md:mx-0">
        {INDOOR_TABLES.map((table) => (
          <TableButton
            key={table.id}
            table={table}
            selected={table.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>

      {selected ? (
        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-accent">
          {ZONE_LABEL[selected.zone]} • {selected.row}. sıra • {selected.col}. masa seçildi
        </p>
      ) : null}
    </div>
  );
}
