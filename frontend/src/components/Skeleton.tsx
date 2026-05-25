import React from 'react';

type SkeletonProps = {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function Skeleton({ width = '100%', height = 12, circle = false, className = '', style }: SkeletonProps) {
  const s: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: circle ? '50%' : 8,
    ...style,
  };

  return <span className={`skeleton ${className}`} style={s} aria-hidden="true" />;
}
