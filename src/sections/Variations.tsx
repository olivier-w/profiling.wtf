import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, Toggle } from '../components/UI'

type ViewMode = 'flamegraph' | 'flamechart' | 'icicle'

interface TimelineEvent {
  name: string
  start: number
  duration: number
  depth: number
}

// Sample timeline data for flame chart
const timelineEvents: TimelineEvent[] = [
  { name: 'main', start: 0, duration: 100, depth: 0 },
  { name: 'handleRequest', start: 5, duration: 40, depth: 1 },
  { name: 'parseJSON', start: 10, duration: 25, depth: 2 },
  { name: 'validate', start: 36, duration: 8, depth: 2 },
  { name: 'processData', start: 50, duration: 45, depth: 1 },
  { name: 'fetchFromDB', start: 52, duration: 30, depth: 2 },
  { name: 'GC Pause', start: 65, duration: 5, depth: 2 },
  { name: 'transform', start: 85, duration: 8, depth: 2 },
]

export default function Variations() {
  const [viewMode, setViewMode] = useState<ViewMode>('flamegraph')

  const renderFlameGraph = (inverted: boolean = false) => {
    const frames = [
      { name: 'main', width: 100, depth: 0, selfTime: 5 },
      { name: 'handleRequest', width: 45, depth: 1, x: 0, selfTime: 2 },
      { name: 'processData', width: 55, depth: 1, x: 45, selfTime: 3 },
      { name: 'parseJSON', width: 25, depth: 2, x: 0, selfTime: 25 },
      { name: 'validate', width: 8, depth: 2, x: 25, selfTime: 8 },
      { name: 'log', width: 12, depth: 2, x: 33, selfTime: 12 },
      { name: 'fetchFromDB', width: 30, depth: 2, x: 45, selfTime: 30 },
      { name: 'transform', width: 15, depth: 2, x: 75, selfTime: 8 },
      { name: 'cache', width: 10, depth: 2, x: 90, selfTime: 10 },
      { name: 'mapFields', width: 7, depth: 3, x: 75, selfTime: 7 },
    ]

    const frameHeight = 22
    const svgHeight = 150
    const colors = ['#ff6b35', '#ff8c42', '#ffa94d', '#ffc078', '#ffd43b', '#ffe066']

    return (
      <svg viewBox="0 0 500 150" className="variation-svg">
        {frames.map((frame, i) => {
          const y = inverted 
            ? frame.depth * (frameHeight + 2) + 10
            : svgHeight - (frame.depth + 1) * (frameHeight + 2)
          const x = (frame.x || 0) * 5
          const width = frame.width * 5

          return (
            <g key={frame.name}>
              <rect
                x={x + 1}
                y={y}
                width={width - 2}
                height={frameHeight}
                fill={colors[i % colors.length]}
                rx={2}
              />
              {width > 40 && (
                <text
                  x={x + width / 2}
                  y={y + frameHeight / 2 + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#000"
                  fontFamily="var(--font-mono)"
                >
                  {frame.name}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    )
  }

  const renderFlameChart = () => {
    const frameHeight = 20
    const scale = 4.5
    const colors = ['#ff6b35', '#ff8c42', '#ffa94d', '#4dabf7', '#ffd43b', '#da77f2', '#f03e3e', '#ffe066']

    return (
      <svg viewBox="0 0 500 120" className="variation-svg">
        {/* Time axis */}
        <line x1="0" y1="100" x2="450" y2="100" stroke="var(--color-border-default)" />
        {[0, 25, 50, 75, 100].map(t => (
          <g key={t}>
            <line x1={t * scale} y1="100" x2={t * scale} y2="105" stroke="var(--color-text-tertiary)" />
            <text x={t * scale} y="115" textAnchor="middle" fontSize="8" fill="var(--color-text-tertiary)">
              {t}ms
            </text>
          </g>
        ))}

        {/* Events */}
        {timelineEvents.map((event, i) => {
          const x = event.start * scale
          const width = event.duration * scale
          const y = event.depth * (frameHeight + 3) + 10
          const color = event.name === 'GC Pause' ? '#f03e3e' : colors[i % colors.length]

          return (
            <g key={`${event.name}-${event.start}`}>
              <rect
                x={x}
                y={y}
                width={width}
                height={frameHeight}
                fill={color}
                rx={2}
              />
              {width > 30 && (
                <text
                  x={x + width / 2}
                  y={y + frameHeight / 2 + 4}
                  textAnchor="middle"
                  fontSize="9"
                  fill={event.name === 'GC Pause' ? '#fff' : '#000'}
                  fontFamily="var(--font-mono)"
                >
                  {event.name}
                </text>
              )}
            </g>
          )
        })}

        {/* GC Pause callout */}
        <line x1={293} y1={55} x2={330} y2={30} stroke="var(--color-error)" strokeDasharray="3,2" />
        <text x={335} y={35} fontSize="9" fill="var(--color-error)">GC Pause!</text>
      </svg>
    )
  }

  const renderDiffFlameGraph = () => {
    const frames = [
      { name: 'main', width: 100, depth: 0, delta: 0 },
      { name: 'handleRequest', width: 45, depth: 1, x: 0, delta: -15 },
      { name: 'processData', width: 55, depth: 1, x: 45, delta: 5 },
      { name: 'parseJSON', width: 10, depth: 2, x: 0, delta: -60, oldWidth: 25 },
      { name: 'validate', width: 8, depth: 2, x: 10, delta: 0 },
      { name: 'cachedParse', width: 5, depth: 2, x: 18, delta: 100, isNew: true },
      { name: 'log', width: 12, depth: 2, x: 23, delta: 0 },
      { name: 'fetchFromDB', width: 30, depth: 2, x: 45, delta: 0 },
      { name: 'transform', width: 15, depth: 2, x: 75, delta: 10 },
    ]

    const frameHeight = 22
    const svgHeight = 130

    const getColor = (delta: number, isNew?: boolean) => {
      if (isNew) return '#3fb950'
      if (delta < -30) return '#58a6ff'
      if (delta < 0) return '#79b8ff'
      if (delta > 30) return '#f85149'
      if (delta > 0) return '#ffa198'
      return '#6e7681'
    }

    return (
      <svg viewBox="0 0 500 130" className="variation-svg">
        {frames.map((frame) => {
          const y = svgHeight - (frame.depth + 1) * (frameHeight + 2)
          const x = (frame.x || 0) * 5
          const width = frame.width * 5
          const color = getColor(frame.delta, frame.isNew)

          return (
            <g key={frame.name}>
              <rect
                x={x + 1}
                y={y}
                width={width - 2}
                height={frameHeight}
                fill={color}
                rx={2}
              />
              {width > 50 && (
                <>
                  <text
                    x={x + width / 2}
                    y={y + frameHeight / 2}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#fff"
                    fontFamily="var(--font-mono)"
                  >
                    {frame.name}
                  </text>
                  <text
                    x={x + width / 2}
                    y={y + frameHeight / 2 + 10}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#fff"
                    fontFamily="var(--font-mono)"
                    opacity={0.8}
                  >
                    {frame.delta > 0 ? `+${frame.delta}%` : frame.isNew ? 'NEW' : `${frame.delta}%`}
                  </text>
                </>
              )}
            </g>
          )
        })}
        {/* Legend */}
        <g transform="translate(10, 5)">
          <rect x="0" y="0" width="12" height="12" fill="#58a6ff" rx="2" />
          <text x="16" y="10" fontSize="8" fill="var(--color-text-secondary)">Improved</text>
          <rect x="70" y="0" width="12" height="12" fill="#f85149" rx="2" />
          <text x="86" y="10" fontSize="8" fill="var(--color-text-secondary)">Regressed</text>
          <rect x="150" y="0" width="12" height="12" fill="#3fb950" rx="2" />
          <text x="166" y="10" fontSize="8" fill="var(--color-text-secondary)">New</text>
        </g>
      </svg>
    )
  }

  return (
    <div className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="section-header">
          <span className="section-number">Section 06</span>
          <h2 className="section-title">Flame Graph Variations</h2>
          <p className="section-subtitle">
            Flame graphs have spawned several related visualizations. Understanding 
            when to use each is key to effective performance analysis.
          </p>
        </div>

        {/* Flame Graph vs Flame Chart */}
        <div className="comparison-section">
          <h3>Flame Graph vs Flame Chart</h3>
          <p className="comparison-intro">
            This is the most common source of confusion. They look similar but show 
            fundamentally different things.
          </p>

          <div className="comparison-table">
            <div className="table-header">
              <div></div>
              <div>Flame Graph</div>
              <div>Flame Chart</div>
            </div>
            <div className="table-row">
              <div>X-axis</div>
              <div>Alphabetical (merged stacks)</div>
              <div>Time (execution order)</div>
            </div>
            <div className="table-row">
              <div>Purpose</div>
              <div>Aggregate: where is time spent?</div>
              <div>Temporal: what happened when?</div>
            </div>
            <div className="table-row">
              <div>Best for</div>
              <div>Finding hot spots</div>
              <div>Understanding sequences</div>
            </div>
            <div className="table-row">
              <div>GC pauses</div>
              <div>Hidden (merged with other stacks)</div>
              <div>Visible as gaps or blocks</div>
            </div>
          </div>

          <div className="demo-container">
            <div className="demo-header">
              <h3 className="demo-title">🔄 Same Data, Different Views</h3>
              <Toggle
                options={[
                  { value: 'flamegraph', label: 'Flame Graph' },
                  { value: 'flamechart', label: 'Flame Chart' },
                ]}
                value={viewMode === 'icicle' ? 'flamegraph' : viewMode}
                onChange={(v) => setViewMode(v as ViewMode)}
              />
            </div>
            
            <div className="demo-content">
              <div className="view-container">
                {viewMode === 'flamegraph' && (
                  <motion.div
                    key="flamegraph"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {renderFlameGraph()}
                    <p className="view-note">
                      <strong>Flame Graph:</strong> parseJSON is 25% of time. 
                      Can't see when things happened.
                    </p>
                  </motion.div>
                )}
                {viewMode === 'flamechart' && (
                  <motion.div
                    key="flamechart"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {renderFlameChart()}
                    <p className="view-note">
                      <strong>Flame Chart:</strong> Notice the GC pause at 65ms! 
                      This is invisible in the flame graph above.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Icicle Charts */}
        <div className="variation-section">
          <h3>Icicle Charts (Inverted Flame Graphs)</h3>
          <div className="icicle-demo">
            <div className="icicle-column">
              <h4>🔥 Flame (Root at Bottom)</h4>
              {renderFlameGraph(false)}
            </div>
            <div className="icicle-column">
              <h4>🧊 Icicle (Root at Top)</h4>
              {renderFlameGraph(true)}
            </div>
          </div>
          <p className="variation-note">
            Same data, different orientation. Some developers prefer icicle charts because 
            the root is always visible without scrolling. It's purely preference.
          </p>
        </div>

        {/* Differential Flame Graphs */}
        <div className="variation-section">
          <h3>Differential Flame Graphs</h3>
          <p className="variation-intro">
            Compare two profiles to see what changed. Essential for validating optimizations.
          </p>

          <Card className="diff-story">
            <h4>📖 The Optimization Story</h4>
            <p>
              "We suspected parseJSON was slow, so we added caching. 
              Let's compare the before and after profiles."
            </p>
          </Card>

          <div className="demo-container">
            <div className="demo-header">
              <h3 className="demo-title">📊 Differential View: Before vs After Caching</h3>
            </div>
            <div className="demo-content">
              {renderDiffFlameGraph()}
              <div className="diff-insights">
                <div className="insight-item improvement">
                  <span className="insight-icon">📉</span>
                  <span>parseJSON: -60% (caching worked!)</span>
                </div>
                <div className="insight-item new">
                  <span className="insight-icon">🆕</span>
                  <span>cachedParse: NEW (cache lookup)</span>
                </div>
                <div className="insight-item regression">
                  <span className="insight-icon">📈</span>
                  <span>transform: +10% (minor regression)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Off-CPU Flame Graphs */}
        <Card className="offcpu-section">
          <h3>⏳ Off-CPU Flame Graphs</h3>
          <p>
            Programs aren't just slow because of CPU. They wait on:
          </p>
          <div className="offcpu-grid">
            <div className="offcpu-item">💾 Disk I/O</div>
            <div className="offcpu-item">🌐 Network calls</div>
            <div className="offcpu-item">🔒 Lock contention</div>
            <div className="offcpu-item">😴 Sleep/scheduling</div>
          </div>
          <p>
            <strong>Off-CPU flame graphs</strong> show where time is spent <em>waiting</em>, 
            not computing. If your CPU flame graph looks fast but the app is slow, 
            check off-CPU time!
          </p>
        </Card>
      </motion.div>

      <style>{`
        .comparison-section,
        .variation-section {
          margin-bottom: var(--space-12);
        }

        .comparison-section h3,
        .variation-section h3 {
          text-align: center;
          margin-bottom: var(--space-4);
        }

        .comparison-intro,
        .variation-intro {
          text-align: center;
          margin-bottom: var(--space-6);
        }

        .comparison-table {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-lg);
          overflow: hidden;
          margin-bottom: var(--space-8);
        }

        .table-header,
        .table-row {
          display: grid;
          grid-template-columns: 120px 1fr 1fr;
          gap: var(--space-4);
        }

        .table-header {
          background: var(--color-bg-tertiary);
          font-weight: 600;
          padding: var(--space-3) var(--space-4);
          border-bottom: 1px solid var(--color-border-default);
        }

        .table-row {
          padding: var(--space-3) var(--space-4);
          border-bottom: 1px solid var(--color-border-muted);
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .table-row > div:first-child {
          color: var(--color-text-tertiary);
          font-size: var(--text-sm);
        }

        .variation-svg {
          width: 100%;
          height: auto;
        }

        .view-container {
          min-height: 200px;
        }

        .view-note {
          text-align: center;
          font-size: var(--text-sm);
          margin-top: var(--space-4);
          padding: var(--space-3);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
        }

        .icicle-demo {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-6);
          margin-bottom: var(--space-4);
        }

        .icicle-column {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
        }

        .icicle-column h4 {
          text-align: center;
          margin-bottom: var(--space-4);
          font-size: var(--text-sm);
        }

        .variation-note {
          text-align: center;
          font-size: var(--text-sm);
          color: var(--color-text-tertiary);
        }

        .diff-story {
          margin-bottom: var(--space-6);
        }

        .diff-story h4 {
          margin-bottom: var(--space-2);
        }

        .diff-insights {
          display: flex;
          gap: var(--space-4);
          justify-content: center;
          margin-top: var(--space-4);
          flex-wrap: wrap;
        }

        .insight-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
        }

        .insight-item.improvement {
          background: rgba(88, 166, 255, 0.2);
          color: var(--color-accent-primary);
        }

        .insight-item.regression {
          background: rgba(248, 81, 73, 0.2);
          color: var(--color-error);
        }

        .insight-item.new {
          background: rgba(63, 185, 80, 0.2);
          color: var(--color-success);
        }

        .offcpu-section {
          margin-top: var(--space-8);
        }

        .offcpu-section h3 {
          margin-bottom: var(--space-4);
        }

        .offcpu-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-3);
          margin: var(--space-4) 0;
        }

        .offcpu-item {
          background: var(--color-bg-tertiary);
          padding: var(--space-3);
          border-radius: var(--radius-md);
          text-align: center;
          font-size: var(--text-sm);
        }

        @media (max-width: 768px) {
          .table-header,
          .table-row {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .icicle-demo {
            grid-template-columns: 1fr;
          }

          .offcpu-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  )
}
