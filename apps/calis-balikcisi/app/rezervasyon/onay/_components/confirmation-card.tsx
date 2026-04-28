import type { ConfirmationState } from '../_lib/format';

type Props = {
  state: ConfirmationState;
};

type Row = {
  label: string;
  value: string;
  highlight?: boolean;
};

export function ConfirmationCard({ state }: Props) {
  const rows: Row[] = [
    { label: 'Date', value: state.formattedDate },
    { label: 'Time', value: state.time },
    { label: 'Guests', value: state.guests },
    { label: 'Table', value: state.tableLabel },
    { label: 'Code', value: state.code, highlight: true },
  ];

  return (
    <dl className="max-w-md mx-auto w-full border-y border-fg/10 py-8">
      {rows.map((row, idx) => {
        const isLast = idx === rows.length - 1;
        return (
          <div
            key={row.label}
            className={`flex justify-between items-center py-3 ${
              isLast ? '' : 'border-b border-fg/10'
            }`}
          >
            <dt className="text-[10px] uppercase tracking-widest text-fg/60">
              {row.label}
            </dt>
            <dd
              className={
                row.highlight
                  ? 'text-2xl md:text-3xl font-display tracking-wider text-accent'
                  : 'text-base text-fg'
              }
            >
              {row.value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
