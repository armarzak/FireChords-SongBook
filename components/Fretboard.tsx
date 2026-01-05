
import React from 'react';

interface FretboardProps {
  root: string;
  type: string;
  chordNotes: any[];
  theme: 'light' | 'dark';
  mode: 'notes' | 'shape';
  fingering?: any; 
}

export const Fretboard: React.FC<FretboardProps> = ({ root, chordNotes, theme, mode, fingering }) => {
  const isDark = theme === 'dark';
  const fretsCount = 15;
  const stringsCount = 6;
  
  const width = 800;
  const height = 180;
  const fretWidth = width / fretsCount;
  const stringHeight = height / (stringsCount - 1);
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };

  // Проверка на диез для скрытия порожка
  const isSharp = root.includes('#');

  // В табах: 1-я струна сверху (e), 6-я снизу (E)
  const stringNames = ['e', 'B', 'G', 'D', 'A', 'E'];
  
  const getStringY = (stringIdx: number) => (5 - stringIdx) * stringHeight;

  return (
    <div className="w-full overflow-x-auto pb-4 cursor-grab active:cursor-grabbing no-scrollbar">
      <svg width={width + margin.left + margin.right} height={height + margin.top + margin.bottom} className="mx-auto">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          
          {/* Порожек (Nut) - скрываем при диезах */}
          {!isSharp && (
            <rect x={-5} y={-2} width={5} height={height + 4} fill={isDark ? "#555" : "#ccc"} rx={2} />
          )}

          {/* Лады (Frets) */}
          {Array.from({ length: fretsCount + 1 }).map((_, i) => (
            <g key={i}>
              <line 
                x1={i * fretWidth} y1={0} 
                x2={i * fretWidth} y2={height} 
                stroke={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"} 
                // Если диез, то первая линия лада обычная (2px), если нет - жирная (4px)
                strokeWidth={i === 0 ? (isSharp ? 2 : 4) : 2} 
              />
              {/* Номера ладов */}
              {i > 0 && (
                <text 
                  x={(i - 0.5) * fretWidth} 
                  y={height + 25} 
                  textAnchor="middle" 
                  fontSize="11" 
                  fontWeight="900"
                  fill={isDark ? "#666" : "#aaa"}
                >
                  {i}
                </text>
              )}
            </g>
          ))}

          {/* Маркеры ладов (Dots) */}
          {[3, 5, 7, 9, 12, 15].map(f => (
            <circle 
              key={f} 
              cx={(f - 0.5) * fretWidth} 
              cy={height / 2} 
              r={f === 12 ? 6 : 5} 
              fill={isDark ? "white" : "black"} 
              fillOpacity={0.05} 
            />
          ))}

          {/* Линии Струн */}
          {Array.from({ length: stringsCount }).map((_, i) => (
            <line 
              key={i} 
              x1={0} y1={i * stringHeight} 
              x2={width} y2={i * stringHeight} 
              stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"} 
              strokeWidth={1 + ((5-i) * 0.5)} 
            />
          ))}

          {/* Режим: Все ноты (Notes) */}
          {mode === 'notes' && chordNotes.map((cn, i) => {
            const cx = cn.fret === 0 ? -15 : (cn.fret - 0.5) * fretWidth;
            const cy = getStringY(cn.stringIdx);
            const color = cn.isRoot ? "#3b82f6" : (isDark ? "#333" : "#e4e4e7");
            const textColor = cn.isRoot ? "white" : (isDark ? "#999" : "#666");

            return (
              <g key={`n-${i}`}>
                <circle cx={cx} cy={cy} r={10} fill={color} stroke={isDark ? "rgba(255,255,255,0.1)" : "none"} />
                <text x={cx} y={cy + 3.5} textAnchor="middle" fontSize="8" fontWeight="bold" fill={textColor}>
                  {cn.label}
                </text>
              </g>
            );
          })}

          {/* Режим: Аппликатура (Shape) */}
          {mode === 'shape' && fingering && (
            <g>
              {/* Барре */}
              {fingering.barre && (
                <rect 
                  x={(fingering.barre.fret - 0.5) * fretWidth - 5} 
                  y={getStringY(fingering.barre.to - 1) - 8}
                  width={10}
                  height={(fingering.barre.to - fingering.barre.from) * stringHeight + 16}
                  rx="5"
                  fill={isDark ? "white" : "#1e1e1e"}
                />
              )}
              {/* Точки зажатия */}
              {fingering.strings.map((fret: any, sIdx: number) => {
                if (fret === 'x') {
                   return <text key={`x-${sIdx}`} x={-15} y={getStringY(sIdx) + 4} textAnchor="middle" fontSize="12" fill="#ef4444" fontWeight="bold">×</text>;
                }
                const actualFret = fret === 0 ? 0 : fret;
                const cx = actualFret === 0 ? -15 : (actualFret - 0.5) * fretWidth;
                const cy = getStringY(sIdx);
                
                return (
                  <g key={`s-${sIdx}`}>
                    <circle 
                      cx={cx} cy={cy} r={12} 
                      fill={actualFret === 0 ? "none" : (isDark ? "white" : "#1a1a1a")} 
                      stroke={actualFret === 0 ? (isDark ? "white" : "#1a1a1a") : "none"}
                    />
                    {fingering.fingers[sIdx] && (
                      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fontWeight="black" fill={isDark ? "black" : "white"}>
                        {fingering.fingers[sIdx]}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* Названия струн слева */}
          {stringNames.map((name, i) => (
            <text key={i} x={-35} y={i * stringHeight + 4} fontSize="11" fontWeight="900" fill={isDark ? "#444" : "#ccc"}>
              {name}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
};
