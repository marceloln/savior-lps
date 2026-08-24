interface SkeletonProps {
  variant?: 'line' | 'circle' | 'card';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ variant = 'line', width, height }: SkeletonProps) {
  const styles: React.CSSProperties = {
    width: width ?? (variant === 'circle' ? 36 : '100%'),
    height: height ?? (variant === 'line' ? 14 : variant === 'circle' ? 36 : 120),
    borderRadius: variant === 'circle' ? '50%' : 6,
  };

  return <div className="skeleton" style={styles} />;
}
