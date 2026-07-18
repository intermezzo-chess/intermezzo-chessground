import { useState } from 'react';
import { FreePlay } from './examples/FreePlay';
import { LegalMoves } from './examples/LegalMoves';
import { Premove } from './examples/Premove';
import { Predrop } from './examples/Predrop';
import { DrawShapes } from './examples/DrawShapes';
import { ViewOnly } from './examples/ViewOnly';
import { CustomTheme } from './examples/CustomTheme';
import { OrientationFlip } from './examples/OrientationFlip';
import { CheckHighlight } from './examples/CheckHighlight';
import { AnimationToggle } from './examples/AnimationToggle';
import { HeadlessHook } from './examples/HeadlessHook';

const examples = [
  { id: 'free-play', label: 'Free play', Component: FreePlay },
  { id: 'legal-moves', label: 'Legal moves (chess.js)', Component: LegalMoves },
  { id: 'premove', label: 'Premove', Component: Premove },
  { id: 'predrop', label: 'Predrop (crazyhouse-style)', Component: Predrop },
  { id: 'draw-shapes', label: 'Draw shapes', Component: DrawShapes },
  { id: 'view-only', label: 'View only', Component: ViewOnly },
  { id: 'custom-theme', label: 'Custom theme', Component: CustomTheme },
  { id: 'orientation-flip', label: 'Orientation flip', Component: OrientationFlip },
  { id: 'check-highlight', label: 'Check highlight', Component: CheckHighlight },
  { id: 'animation-toggle', label: 'Animation toggle', Component: AnimationToggle },
  { id: 'headless-hook', label: 'Headless useChessground', Component: HeadlessHook },
] as const;

export function App() {
  const [activeId, setActiveId] = useState<(typeof examples)[number]['id']>(examples[0].id);
  const active = examples.find((e) => e.id === activeId)!;

  return (
    <div className="app">
      <header className="app-header">
        <h1>@intermezzo/chessground-react</h1>
        <p>A live playground for every chessground feature exposed by this library.</p>
      </header>
      <div className="app-body">
        <nav className="app-nav">
          {examples.map((e) => (
            <button
              key={e.id}
              className={e.id === activeId ? 'active' : ''}
              onClick={() => setActiveId(e.id)}
            >
              {e.label}
            </button>
          ))}
        </nav>
        <main className="app-main">
          <h2>{active.label}</h2>
          <active.Component />
        </main>
      </div>
    </div>
  );
}
