
import React from 'react';

interface CircleOfFifthsProps {
  selectedKey: string;
  onSelectKey: (key: string) => void;
  isMinor: boolean;
}

export const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({ selectedKey, onSelectKey, isMinor }) => {
  const keys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'Ab', 'Eb', 'Bb', 'F'];
  const minorKeys = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m', 'Fm', 'Cm', 'Gm', 'Dm'];
  
  const size = 280;
  const center = size / 2;
  const radius = size * 0.4;
  const innerRadius = size * 0.25;

  return (
    <div className="relative flex items-center justify-center py-4 select-none">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="40" />
        
        {keys.map((key, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          
          const label = isMinor ? minorKeys[i] : key;
          // Корень для выбора тональности (без 'm')
          const rootValue = isMinor ? minorKeys[i].replace('m', '') : key;
          
          const isSelected = selectedKey === rootValue;

          return (
            <g 
              key={key} 
              className="cursor-pointer" 
              onClick={() => onSelectKey(rootValue)}
            >
              {isSelected && (
                <circle cx={x} cy={y} r="22" fill="#3b82f6" className="animate-pulse" />
              )}
              
              <circle 
                cx={x} 
                cy={y} 
                r="20" 
                fill={isSelected ? "#3b82f6" : "#1e1e1e"} 
                stroke={isSelected ? "#60a5fa" : "rgba(255,255,255,0.1)"}
                strokeWidth="1"
              />
              
              <text 
                x={x} 
                y={y + 5} 
                textAnchor="middle" 
                fill="white" 
                fontSize="12" 
                fontWeight="bold"
                className="pointer-events-none"
              >
                {label}
              </text>
            </g>
          );
        })}

        <circle cx={center} cy={center} r={innerRadius} fill="#121212" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <text x={center} y={center + 5} textAnchor="middle" fill="#facc15" fontSize="10" fontWeight="black" className="uppercase tracking-widest">
          {isMinor ? 'Minor' : 'Major'}
        </text>
      </svg>
    </div>
  );
};
