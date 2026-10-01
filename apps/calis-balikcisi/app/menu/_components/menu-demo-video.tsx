'use client';

import { useState } from 'react';

export function MenuDemoVideo() {
  const [failed, setFailed] = useState(false);

  // Video yüklenemezse alan hiç gösterilmez — sitede "video gelecek" gibi yer tutucu metin kalmaz.
  if (failed) return null;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '720px',
        margin: '0 auto',
        borderRadius: '8px',
        overflow: 'hidden',
        aspectRatio: '16/9',
      }}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
        onError={() => setFailed(true)}
      >
        <source src="/menu-loop.webm" type="video/webm" />
        <source src="/menu-loop.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
