
import React from 'react';

interface CircleOfFifthsProps {
  selectedKey: string;
  onSelectKey: (key: string) => void;
  isMinor: boolean;
  theme?: 'light' | 'dark';
}

export const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({ selectedKey, onSelectKey, isMinor, theme = 'dark' }) => {
  const keys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'Ab', 'Eb', 'Bb', 'F'];
  const minorKeys = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m', 'Fm', 'Cm', 'Gm', 'Dm'];
  const isDark = theme === 'dark';
  
  const size = 280;
  const center = size / 2;
  const radius = size * 0.4;
  const innerRadius = size * 0.25;

  return (
    <div className="relative flex items-center justify-center py-4 select-none">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"} strokeWidth="40" />
        
        {keys.map((key, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          
          const label = isMinor ? minorKeys[i] : key;
          const rootValue = isMinor ? minorKeys[i].replace('m', '') : key;
          const isSelected = selectedKey === rootValue;

          return (
            <g 
              key={key} 
              className="cursor-pointer" 
              onClick={() => onSelectKey(rootValue)}
            >
              {isSelected && (
                <circle cx={x} cy={y} r="22" fill={isDark ? "#3b82f6" : "#3b82f6"} className="opacity-20 animate-pulse" />
              )}
              
              <circle 
                cx={x} 
                cy={y} 
                r="20" 
                fill={isSelected ? (isDark ? "#3b82f6" : "#3b82f6") : (isDark ? "#1e1e1e" : "#ffffff")} 
                stroke={isSelected ? "#60a5fa" : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)")}
                strokeWidth="1"
                className="transition-colors duration-300"
              />
              
              <text 
                x={x} 
                y={y + 5} 
                textAnchor="middle" 
                fill={isSelected ? "white" : (isDark ? "white" : "#1a1a1a")} 
                fontSize="12" 
                fontWeight="bold"
                className="pointer-events-none transition-colors duration-300"
              >
                {label}
              </text>
            </g>
          );
        })}

        <circle cx={center} cy={center} r={innerRadius} fill={isDark ? "#121212" : "#f8f9fa"} stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"} strokeWidth="1" />
        <text x={center} y={center + 5} textAnchor="middle" fill={isDark ? "#facc15" : "#3b82f6"} fontSize="10" fontWeight="black" className="uppercase tracking-widest">
          {isMinor ? 'Minor' : 'Major'}
        </text>
      </svg>
    </div>
  );
};
