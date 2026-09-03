'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface LogoProps {
  height?: number;
  width?: number;
  showTagline?: boolean;
  inverse?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function Logo({
  height = 36,
  width,
  showTagline = true,
  inverse = false,
  className = '',
  style = {},
}: LogoProps) {
  const [imgError, setImgError] = useState(false);

  // Jika user meletakkan file gambar di /images/logo.png atau /logo.png, Next.js akan langsung menyajikannya
  // Jika gambar gagal dimuat (atau belum disalin), fallback ke vector SVG brand yang presisi
  if (!imgError) {
    return (
      <div
        className={`responku-logo-wrapper ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          lineHeight: 1,
          ...style,
        }}
      >
        <img
          src="/images/logo.png"
          alt="ResponKu"
          height={height}
          style={{
            height: `${height}px`,
            width: width ? `${width}px` : 'auto',
            objectFit: 'contain',
            display: 'block',
          }}
          onError={() => {
            // Coba fallback ke /logo.png atau fallback vector
            setImgError(true);
          }}
        />
      </div>
    );
  }

  // Fallback vector SVG jika gambar fisik belum diletakkan
  return (
    <div
      className={`responku-logo-fallback ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        userSelect: 'none',
        ...style,
      }}
    >
      <div
        style={{
          width: `${height}px`,
          height: `${height}px`,
          borderRadius: '8px',
          background: '#1B6FE0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          color: '#FFFFFF',
          fontSize: `${Math.round(height * 0.55)}px`,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        R
        <div
          style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            width: `${Math.max(6, Math.round(height * 0.22))}px`,
            height: `${Math.max(6, Math.round(height * 0.22))}px`,
            borderRadius: '50%',
            background: '#1C9A5B',
            border: '1.5px solid #FFFFFF',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div
          style={{
            fontSize: `${Math.round(height * 0.58)}px`,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          <span style={{ color: inverse ? '#FFFFFF' : '#0B2E63' }}>Respon</span>
          <span style={{ color: '#1B6FE0' }}>K</span>
          <span style={{ color: '#1C9A5B' }}>u</span>
        </div>
        {showTagline && (
          <div
            style={{
              fontSize: `${Math.max(10, Math.round(height * 0.26))}px`,
              fontWeight: 500,
              color: inverse ? '#E0E4E9' : '#6B7785',
              letterSpacing: '0.01em',
              lineHeight: 1.2,
            }}
          >
            Temukan Responden yang Tepat
          </div>
        )}
      </div>
    </div>
  );
}
