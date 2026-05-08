'use client';

import { useState } from 'react';

export function MenuDemoVideo() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          margin: '0 auto',
          aspectRatio: '16/9',
          background: 'rgba(31,26,18,0.3)',
          border: '2px dashed rgba(243,234,216,0.15)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--serif)',
            fontSize: '0.85rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase' as const,
            color: 'rgba(243,234,216,0.4)',
          }}
        >
          video gelecek
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '720px',
        margin: '0 auto',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <video
        src="/menu-loop.mov"
        autoPlay
        muted
        loop
        playsInline
        style={{ width: '100%', display: 'block' }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
