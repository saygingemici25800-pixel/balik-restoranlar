'use client';

import { useEffect, useRef } from 'react';
import type { GalleryItem, GallerySection } from '../_data';

type Props = {
  item: GalleryItem;
  section: GallerySection;
  onClose: () => void;
};

export function GalleryItemModal({ item, section, onClose }: Props) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        closeBtnRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`modal-${item.id}-title`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/95 p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-bg border border-fg/10 p-8 md:p-12">
        <button
          ref={closeBtnRef}
          type="button"
          aria-label="Kapat"
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 inline-flex items-center justify-center text-fg/70 hover:text-accent transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
            aria-hidden="true"
          >
            <line x1="5" y1="5" x2="19" y2="19" />
            <line x1="19" y1="5" x2="5" y2="19" />
          </svg>
        </button>

        <p className="text-xs uppercase tracking-[0.35em] text-accent">
          {section.eyebrow}
        </p>
        <h2
          id={`modal-${item.id}-title`}
          className="mt-4 font-display text-3xl md:text-4xl text-fg"
        >
          {item.name}
        </h2>
        <div className="mt-8 aspect-[4/3] bg-fg/5" aria-hidden="true" />
        <p className="mt-8 text-fg/80 leading-relaxed whitespace-pre-line">
          {item.description}
        </p>
      </div>
    </div>
  );
}
