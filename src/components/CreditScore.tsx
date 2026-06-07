interface CreditScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function CreditScore({ score, size = 'md' }: CreditScoreProps) {
  const sizeConfig = {
    sm: { circle: 'w-12 h-12', stroke: 2, text: 'text-xs', label: 'hidden' },
    md: { circle: 'w-20 h-20', stroke: 3, text: 'text-lg', label: 'text-xs' },
    lg: { circle: 'w-32 h-32', stroke: 4, text: 'text-2xl', label: 'text-sm' }
  }[size];

  const radius = (size === 'sm' ? 48 : size === 'md' ? 80 : 128) / 2 - sizeConfig.stroke;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;

  const getScoreColor = () => {
    if (score >= 90) return '#d4af37';
    if (score >= 70) return '#4ade80';
    if (score >= 50) return '#fbbf24';
    return '#f87171';
  };

  const getScoreLabel = () => {
    if (score >= 90) return '信誉极好';
    if (score >= 70) return '信誉良好';
    if (score >= 50) return '信誉一般';
    return '信誉较差';
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeConfig.circle}`}>
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke="#333333"
            strokeWidth={sizeConfig.stroke}
          />
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke={getScoreColor()}
            strokeWidth={sizeConfig.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${sizeConfig.text} font-bold`} style={{ color: getScoreColor() }}>
            {score}
          </span>
          <span className={`${sizeConfig.label} text-cream-400 ${sizeConfig.label}`}>
            {getScoreLabel()}
          </span>
        </div>
      </div>
    </div>
  );
}
