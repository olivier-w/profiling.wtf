import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button, Card, Toggle } from '../components/UI'

interface FlameFrame {
  name: string
  value: number
  selfValue: number
  children: FlameFrame[]
  x?: number
  width?: number
  depth?: number
}

// Sample data representing a realistic profile
const sampleProfile: FlameFrame = {
  name: 'root',
  value: 100,
  selfValue: 0,
  children: [
    {
      name: 'main',
      value: 100,
      selfValue: 5,
      children: [
        {
          name: 'handleRequest',
          value: 40,
          selfValue: 2,
          children: [
            {
              name: 'parseJSON',
              value: 25,
              selfValue: 25,
              children: []
            },
            {
              name: 'validate',
              value: 8,
              selfValue: 8,
              children: []
            },
            {
              name: 'log',
              value: 5,
              selfValue: 5,
              children: []
            }
          ]
        },
        {
          name: 'processData',
          value: 55,
          selfValue: 3,
          children: [
            {
              name: 'fetchFromDB',
              value: 30,
              selfValue: 30,
              children: []
            },
            {
              name: 'transform',
              value: 15,
              selfValue: 10,
              children: [
                {
                  name: 'mapFields',
                  value: 5,
                  selfValue: 5,
                  children: []
                }
              ]
            },
            {
              name: 'cache',
              value: 7,
              selfValue: 7,
              children: []
            }
          ]
        }
      ]
    }
  ]
}

type ColorScheme = 'random' | 'heat' | 'type'

export default function ReadingFlameGraphs() {
  const [hoveredFrame, setHoveredFrame] = useState<FlameFrame | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [zoomedFrame, setZoomedFrame] = useState<FlameFrame | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [colorScheme, setColorScheme] = useState<ColorScheme>('random')
  const [showGuidedTour, setShowGuidedTour] = useState(true)
  const [tourStep, setTourStep] = useState(0)
  const svgRef = useRef<SVGSVGElement>(null)

  const displayRoot = zoomedFrame || sampleProfile
  const totalValue = sampleProfile.value
  const displayValue = displayRoot.value

  const tourSteps = [
    {
      title: 'Welcome to the Flame Graph Explorer!',
      content: 'This is an interactive flame graph. Let\'s learn how to read it.',
      highlight: null,
    },
    {
      title: 'Y-axis = Stack Depth',
      content: 'Each row represents a level in the call stack. The root is at the bottom.',
      highlight: 'main',
    },
    {
      title: 'Width = Time Spent',
      content: 'Wider frames took more time. Look at parseJSON and fetchFromDB - they\'re wide because they\'re expensive.',
      highlight: 'parseJSON',
    },
    {
      title: 'Self-Time vs Total-Time',
      content: 'Total time includes children. Self-time is the frame\'s own work. processData has low self-time but high total-time.',
      highlight: 'processData',
    },
    {
      title: 'Try Clicking!',
      content: 'Click any frame to zoom in. Double-click to reset. Try searching too!',
      highlight: null,
    },
  ]

  const getColor = (frame: FlameFrame, depth: number): string => {
    if (searchTerm && !frame.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return '#333'
    }

    if (colorScheme === 'heat') {
      const selfPercent = frame.selfValue / totalValue
      if (selfPercent > 0.15) return '#c41e3a'
      if (selfPercent > 0.1) return '#ff6b35'
      if (selfPercent > 0.05) return '#ffa94d'
      if (selfPercent > 0.02) return '#ffd43b'
      return '#4dabf7'
    }

    if (colorScheme === 'type') {
      if (['parseJSON', 'validate', 'log'].includes(frame.name)) return '#4dabf7' // user
      if (['fetchFromDB', 'cache'].includes(frame.name)) return '#da77f2' // library
      return '#69db7c' // system
    }

    // Random warm colors
    const colors = ['#ff6b35', '#ff8c42', '#ffa94d', '#ffc078', '#ffd43b', '#ffe066', '#e8590c', '#fd7e14']
    const index = Math.abs(frame.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length
    return colors[index]
  }

  const calculatePercentage = (value: number) => ((value / totalValue) * 100).toFixed(1)

  const renderFlameGraph = (
    node: FlameFrame, 
    depth: number, 
    startX: number, 
    availableWidth: number
  ): JSX.Element[] => {
    const elements: JSX.Element[] = []
    const frameHeight = 22
    const gap = 1
    const svgHeight = 250
    
    if (node.name !== 'root') {
      const width = (node.value / displayValue) * availableWidth
      const x = startX
      const y = svgHeight - (depth * (frameHeight + gap)) - frameHeight
      
      const isHighlighted = tourStep > 0 && tourSteps[tourStep]?.highlight === node.name
      const isSearchMatch = searchTerm && node.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      elements.push(
        <g 
          key={`${node.name}-${depth}-${startX}`}
          onMouseEnter={(e) => {
            setHoveredFrame(node)
            const rect = (e.target as SVGElement).getBoundingClientRect()
            setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 10 })
          }}
          onMouseLeave={() => setHoveredFrame(null)}
          onClick={() => setZoomedFrame(node === zoomedFrame ? null : node)}
          style={{ cursor: 'pointer' }}
        >
          <motion.rect
            x={x + gap}
            y={y}
            width={Math.max(0, width - gap * 2)}
            height={frameHeight}
            fill={getColor(node, depth)}
            rx={2}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              stroke: isHighlighted ? '#58a6ff' : isSearchMatch ? '#3fb950' : 'none',
              strokeWidth: isHighlighted || isSearchMatch ? 2 : 0,
            }}
            whileHover={{ opacity: 0.8 }}
          />
          {width > 35 && (
            <text
              x={x + width / 2}
              y={y + frameHeight / 2 + 4}
              textAnchor="middle"
              fontSize="10"
              fill={getColor(node, depth) === '#333' ? '#666' : '#000'}
              fontFamily="var(--font-mono)"
              fontWeight="500"
              pointerEvents="none"
            >
              {node.name.length > width / 7 ? node.name.slice(0, Math.floor(width / 7)) + '…' : node.name}
            </text>
          )}
        </g>
      )
    }
    
    let childX = startX
    const sortedChildren = [...node.children].sort((a, b) => a.name.localeCompare(b.name))
    sortedChildren.forEach(child => {
      const childWidth = (child.value / displayValue) * availableWidth
      elements.push(...renderFlameGraph(child, depth + 1, childX, availableWidth))
      childX += childWidth
    })
    
    return elements
  }

  // Calculate search matches percentage
  const countMatches = (node: FlameFrame): number => {
    let count = node.name.toLowerCase().includes(searchTerm.toLowerCase()) ? node.value : 0
    node.children.forEach(child => count += countMatches(child))
    return count
  }
  const matchPercentage = searchTerm ? ((countMatches(sampleProfile) / totalValue) * 100).toFixed(1) : null

  return (
    <div className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="section-header">
          <span className="section-number">Section 04</span>
          <h2 className="section-title">Reading Flame Graphs</h2>
          <p className="section-subtitle">
            Now that you know how flame graphs are built, let's learn how to read them 
            and extract actionable insights.
          </p>
        </div>

        {/* Anatomy Overview */}
        <div className="anatomy-section">
          <h3>Anatomy of a Flame Graph</h3>
          <div className="anatomy-grid">
            <Card>
              <h4>📊 Y-axis: Stack Depth</h4>
              <p>Root at bottom, leaves at top. Each row is a stack level. Taller = deeper call stack.</p>
            </Card>
            <Card>
              <h4>↔️ X-axis: Alphabetical</h4>
              <p>NOT time! Siblings sorted alphabetically. Same function = same horizontal position.</p>
            </Card>
            <Card>
              <h4>📏 Width: Sample Count</h4>
              <p>Wider = more samples = more time. This is the key insight for finding bottlenecks.</p>
            </Card>
            <Card>
              <h4>🔝 Top Edge: On-CPU</h4>
              <p>Functions at the top were actually executing. Below them: their callers (ancestors).</p>
            </Card>
          </div>
        </div>

        {/* Guided Tour Banner */}
        {showGuidedTour && (
          <motion.div 
            className="tour-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="tour-content">
              <h4>{tourSteps[tourStep].title}</h4>
              <p>{tourSteps[tourStep].content}</p>
            </div>
            <div className="tour-controls">
              {tourStep > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setTourStep(t => t - 1)}>
                  ← Back
                </Button>
              )}
              {tourStep < tourSteps.length - 1 ? (
                <Button size="sm" onClick={() => setTourStep(t => t + 1)}>
                  Next →
                </Button>
              ) : (
                <Button size="sm" onClick={() => setShowGuidedTour(false)}>
                  Got it! ✓
                </Button>
              )}
            </div>
            <button className="tour-close" onClick={() => setShowGuidedTour(false)}>×</button>
          </motion.div>
        )}

        {/* Flame Graph Demo */}
        <div className="demo-container">
          <div className="demo-header">
            <h3 className="demo-title">🔥 Flame Graph Explorer</h3>
            <div className="demo-controls">
              <input
                type="text"
                className="search-input"
                placeholder="Search functions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {matchPercentage && (
                <span className="match-percentage">{matchPercentage}% match</span>
              )}
            </div>
          </div>

          <div className="controls-bar">
            <Toggle
              options={[
                { value: 'random', label: 'Random Colors' },
                { value: 'heat', label: 'Heat Map' },
                { value: 'type', label: 'By Type' },
              ]}
              value={colorScheme}
              onChange={(v) => setColorScheme(v as ColorScheme)}
            />
            {zoomedFrame && (
              <Button variant="ghost" size="sm" onClick={() => setZoomedFrame(null)}>
                Reset Zoom
              </Button>
            )}
          </div>

          <div className="flamegraph-wrapper">
            <svg 
              ref={svgRef}
              viewBox="0 0 700 250" 
              className="flamegraph-svg"
              onDoubleClick={() => setZoomedFrame(null)}
            >
              <line x1="0" y1="249" x2="700" y2="249" stroke="var(--color-border-default)" />
              {renderFlameGraph(displayRoot, 0, 0, 700)}
            </svg>

            {/* Tooltip */}
            {hoveredFrame && (
              <div 
                className="flame-tooltip"
                style={{ 
                  left: `${tooltipPos.x}px`, 
                  top: `${tooltipPos.y}px`,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                <div className="tooltip-name">{hoveredFrame.name}</div>
                <div className="tooltip-stats">
                  <div className="tooltip-row">
                    <span>Total:</span>
                    <span className="tooltip-value">{calculatePercentage(hoveredFrame.value)}%</span>
                  </div>
                  <div className="tooltip-row">
                    <span>Self:</span>
                    <span className="tooltip-value">{calculatePercentage(hoveredFrame.selfValue)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="legend">
            <p><strong>Tip:</strong> Click to zoom into a frame. Double-click to reset. Use search to highlight functions.</p>
          </div>
        </div>

        {/* Self-Time vs Total-Time */}
        <div className="time-comparison">
          <h3>Self-Time vs Total-Time</h3>
          <div className="comparison-grid">
            <Card className="time-card">
              <h4>Total Time (Width)</h4>
              <div className="time-visual total-time">
                <div className="time-bar" style={{ width: '100%' }}></div>
              </div>
              <p>
                The full width of the frame. Includes time in the function AND 
                all functions it called.
              </p>
              <code>processData: 55% total time</code>
            </Card>
            <Card className="time-card">
              <h4>Self Time (Top Edge Only)</h4>
              <div className="time-visual self-time">
                <div className="time-bar" style={{ width: '5%' }}></div>
              </div>
              <p>
                Time spent IN the function itself, not in children. 
                This is the actual work to optimize.
              </p>
              <code>processData: 3% self time</code>
            </Card>
          </div>
          <div className="insight-callout">
            <span className="callout-icon">💡</span>
            <p>
              A wide frame with low self-time is just a "caller"—it's not slow itself, 
              it just calls slow things. Look at its children to find the real bottleneck.
            </p>
          </div>
        </div>
      </motion.div>

      <style>{`
        .anatomy-section {
          margin-bottom: var(--space-12);
        }

        .anatomy-section h3 {
          text-align: center;
          margin-bottom: var(--space-6);
        }

        .anatomy-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-4);
        }

        .anatomy-grid h4 {
          font-size: var(--text-sm);
          margin-bottom: var(--space-2);
        }

        .anatomy-grid p {
          font-size: var(--text-xs);
        }

        .tour-banner {
          background: linear-gradient(135deg, rgba(88, 166, 255, 0.1), rgba(88, 166, 255, 0.05));
          border: 1px solid var(--color-accent-primary);
          border-radius: var(--radius-lg);
          padding: var(--space-4) var(--space-6);
          margin-bottom: var(--space-6);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        .tour-content h4 {
          color: var(--color-accent-primary);
          margin-bottom: var(--space-1);
        }

        .tour-content p {
          font-size: var(--text-sm);
          margin: 0;
        }

        .tour-controls {
          display: flex;
          gap: var(--space-2);
        }

        .tour-close {
          position: absolute;
          top: var(--space-2);
          right: var(--space-2);
          background: transparent;
          border: none;
          color: var(--color-text-tertiary);
          cursor: pointer;
          font-size: var(--text-lg);
        }

        .search-input {
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-md);
          padding: var(--space-2) var(--space-3);
          font-size: var(--text-sm);
          color: var(--color-text-primary);
          width: 200px;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--color-accent-primary);
        }

        .match-percentage {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          color: var(--color-success);
        }

        .controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-4);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
        }

        .flamegraph-wrapper {
          position: relative;
          padding: var(--space-4);
        }

        .flamegraph-svg {
          width: 100%;
          height: auto;
        }

        .flame-tooltip {
          position: fixed;
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-md);
          padding: var(--space-3);
          z-index: var(--z-tooltip);
          pointer-events: none;
          box-shadow: var(--shadow-lg);
        }

        .tooltip-name {
          font-family: var(--font-mono);
          font-weight: 600;
          margin-bottom: var(--space-2);
          color: var(--color-text-primary);
        }

        .tooltip-row {
          display: flex;
          justify-content: space-between;
          gap: var(--space-4);
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
        }

        .tooltip-value {
          font-family: var(--font-mono);
          color: var(--color-accent-primary);
        }

        .legend {
          text-align: center;
          padding: var(--space-3);
          font-size: var(--text-sm);
          color: var(--color-text-tertiary);
        }

        .time-comparison {
          margin-top: var(--space-12);
        }

        .time-comparison h3 {
          text-align: center;
          margin-bottom: var(--space-6);
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-6);
          margin-bottom: var(--space-6);
        }

        .time-card h4 {
          margin-bottom: var(--space-4);
        }

        .time-visual {
          height: 24px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-sm);
          margin-bottom: var(--space-4);
          overflow: hidden;
        }

        .time-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--color-flame-warm), var(--color-flame-hot));
          border-radius: var(--radius-sm);
        }

        .time-card p {
          font-size: var(--text-sm);
          margin-bottom: var(--space-3);
        }

        .time-card code {
          display: block;
          font-size: var(--text-xs);
        }

        .insight-callout {
          display: flex;
          align-items: flex-start;
          gap: var(--space-4);
          background: var(--color-warning-subtle);
          border: 1px solid var(--color-warning);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
        }

        .callout-icon {
          font-size: var(--text-2xl);
        }

        .insight-callout p {
          margin: 0;
          font-size: var(--text-sm);
        }

        @media (max-width: 1024px) {
          .anatomy-grid,
          .comparison-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .anatomy-grid,
          .comparison-grid {
            grid-template-columns: 1fr;
          }

          .tour-banner {
            flex-direction: column;
            text-align: center;
            gap: var(--space-4);
          }
        }
      `}</style>
    </div>
  )
}
