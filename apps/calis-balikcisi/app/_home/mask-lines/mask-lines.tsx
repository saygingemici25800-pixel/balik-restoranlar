import { Fragment, type CSSProperties, type ReactNode } from 'react';

import m from '../motion.module.css';

/**
 * Satır maskesi (M2): her satır kendi kutusundan aşağıdan yükselir. Satırlar arasında boşluk
 * metni var — ekran okuyucu tek cümle okur. `load`: hero için JS beklemeden CSS animasyonu.
 */
type MaskLinesProps = {
  lines: readonly ReactNode[];
  as?: 'h1' | 'h2' | 'p';
  id?: string;
  className?: string;
  load?: boolean;
  /** Satırlardan hangileri aynı satırda (geniş ekranda) birleşsin — hero için. */
  inlineFrom?: number;
};

export function MaskLines({ lines, as: Tag = 'h2', id, className, load = false }: MaskLinesProps) {
  return (
    <Tag id={id} className={className} data-reveal={load ? undefined : 'line'}>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 ? ' ' : null}
          <span className={m.line}>
            <span className={`${m.lineInner} ${load ? m.loadLine : ''}`} style={{ '--i': i } as CSSProperties}>
              {line}
            </span>
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}
