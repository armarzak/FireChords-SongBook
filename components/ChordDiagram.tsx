
import React from 'react';
import { ChordFingering } from '../services/chordLibrary';

interface ChordDiagramProps {
  fingering: ChordFingering;
}

export const ChordDiagram: React.FC<ChordDiagramProps> = ({ fingering }) => {
  const { strings, fingers, barre, position, name } = fingering;
  
  const marginX = 15;
  const marginY = 20;
  const stringSpacing = 10;
  const fretSpacing = 14;

  return (
    <div className="flex flex-col items-center bg-zinc-900 border border-white/10 p-3 rounded-2xl w-32 shadow-xl">
      <span className="text-[10px] font-black text-yellow-500 mb-2 uppercase tracking-tighter truncate w-full text-center">
        {name}
      </span>
      
      <svg width="80" height="110" viewBox="0 0 80 110">
        {/* Порядковый номер лада слева */}
        {position > 1 && (
          <text x="2" y={marginY + 10} fill="#facc15" fontSize="8" fontWeight="bold">{position}fr</text>
        )}

        {/* Верхний порожек (жирный, если 1 лад) */}
        <line 
          x1={marginX} y1={marginY} 
          x2={marginX + 5 * stringSpacing} y2={marginY} 
          stroke="white" 
          strokeWidth={position === 1 ? 3 : 1} 
        />
        
        {/* Лады */}
        {[1, 2, 3, 4, 5].map(i => (
          <line 
            key={i} 
            x1={marginX} y1={marginY + i * fretSpacing} 
            x2={marginX + 5 * stringSpacing} y2={marginY + i * fretSpacing} 
            stroke="rgba(255,255,255,0.2)" 
          />
        ))}
        
        {/* Струны */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <line 
            key={i} 
            x1={marginX + i * stringSpacing} y1={marginY} 
            x2={marginX + i * stringSpacing} y2={marginY + 5 * fretSpacing} 
            stroke="rgba(255,255,255,0.4)" 
          />
        ))}

        {/* Маркеры над струнами (X или O) */}
        {strings.map((fret, i) => {
          const x = marginX + i * stringSpacing;
          if (fret === 'x') {
            return <text key={i} x={x} y={marginY - 5} fill="#ef4444" fontSize="8" textAnchor="middle" fontWeight="bold">×</text>;
          }
          if (fret === 0) {
            return <circle key={i} cx={x} cy={marginY - 6} r="2" fill="none" stroke="white" strokeWidth="1" />;
          }
          return null;
        })}

        {/* Барре */}
        {barre && (
          <rect 
            x={marginX + (barre.from - 1) * stringSpacing - 4} 
            y={marginY + (barre.fret - 1) * fretSpacing + 3} 
            width={(barre.to - barre.from) * stringSpacing + 8} 
            height="8" 
            rx="4" 
            fill="white" 
          />
        )}

        {/* Точки пальцев и номера */}
        {strings.map((fret, i) => {
          if (typeof fret !== 'number' || fret === 0) return null;
          
          const relativeFret = fret; // В нашем словаре fret уже относительный лад внутри 5-ладовой сетки? 
          // Нет, в словаре абсолютный лад. Вычисляем относительный:
          const fretInGrid = fret - position + 1;
          
          if (fretInGrid < 1 || fretInGrid > 5) return null;

          const cx = marginX + i * stringSpacing;
          const cy = marginY + (fretInGrid - 1) * fretSpacing + (fretSpacing / 2);
          const finger = fingers[i];

          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r="5" fill={finger ? "white" : "rgba(255,255,255,0.5)"} />
              {finger && (
                <text x={cx} y={cy + 2.5} fill="black" fontSize="7" fontWeight="black" textAnchor="middle">
                  {finger}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
