import React from 'react';

interface TrendGaugeProps {
  score: number; // -100 to +100
  size?: number;
}

const TrendGauge: React.FC<TrendGaugeProps> = ({ score, size = 200 }) => {
  const clampedScore = Math.max(-100, Math.min(100, score));
  // Map -100..+100 to 180..0 degrees (left to right arc)
  const angle = 180 - ((clampedScore + 100) / 200) * 180;
  const radians = (angle * Math.PI) / 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const needleLen = r * 0.85;
  const nx = cx + needleLen * Math.cos(radians);
  const ny = cy - needleLen * Math.sin(radians);

  const getColor = (s: number) => {
    if (s >= 50) return '#0ECB81';
    if (s >= 20) return '#6FCF97';
    if (s >= -20) return '#F0B90B';
    if (s >= -50) return '#F6A04D';
    return '#F6465D';
  };

  return (
    <div className="gauge-container">
      <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
        {/* Background arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="#2B3139"
          strokeWidth={size * 0.08}
          strokeLinecap="round"
        />
        {/* Gradient arc segments */}
        {[
          { start: 180, end: 144, color: '#F6465D' },
          { start: 144, end: 108, color: '#F6A04D' },
          { start: 108, end: 72, color: '#F0B90B' },
          { start: 72, end: 36, color: '#6FCF97' },
          { start: 36, end: 0, color: '#0ECB81' },
        ].map((seg, i) => {
          const s = (seg.start * Math.PI) / 180;
          const e = (seg.end * Math.PI) / 180;
          const x1 = cx + r * Math.cos(s);
          const y1 = cy - r * Math.sin(s);
          const x2 = cx + r * Math.cos(e);
          const y2 = cy - r * Math.sin(e);
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
              fill="none"
              stroke={seg.color}
              strokeWidth={size * 0.06}
              strokeLinecap="round"
              opacity={0.3}
            />
          );
        })}
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke={getColor(clampedScore)}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={6} fill={getColor(clampedScore)} />
        {/* Labels */}
        <text x={cx - r - 5} y={cy + 20} fill="#848E9C" fontSize={12} textAnchor="middle">
          -100
        </text>
        <text x={cx + r + 5} y={cy + 20} fill="#848E9C" fontSize={12} textAnchor="middle">
          +100
        </text>
        <text x={cx} y={cy + 20} fill="#EAECEF" fontSize={12} textAnchor="middle">
          0
        </text>
      </svg>
      <div
        style={{
          fontSize: size * 0.16,
          fontWeight: 700,
          color: getColor(clampedScore),
          marginTop: -10,
        }}
      >
        {clampedScore > 0 ? '+' : ''}{clampedScore}
      </div>
    </div>
  );
};

export default TrendGauge;
