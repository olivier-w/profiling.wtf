import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Card } from '../components/UI'

interface FlameNode {
  name: string
  value: number
  children: FlameNode[]
}

const initialSamples = `main;processData;parseJSON;readFile
main;processData;parseJSON;readFile
main;processData;parseJSON
main;processData;validate
main;processData;validate
main;handleRequest;log`

export default function BuildingFlameGraphs() {
  const [rawSamples, setRawSamples] = useState(initialSamples)
  const [step, setStep] = useState(0) // 0: raw, 1: folded, 2: building, 3: sorted
  const [isAnimating, setIsAnimating] = useState(false)

  // Parse samples into lines
  const sampleLines = useMemo(() => 
    rawSamples.trim().split('\n').filter(line => line.trim()),
    [rawSamples]
  )

  // Fold samples (count occurrences)
  const foldedSamples = useMemo(() => {
    const counts: Record<string, number> = {}
    sampleLines.forEach(line => {
      counts[line] = (counts[line] || 0) + 1
    })
    return Object.entries(counts).map(([stack, count]) => ({ stack, count }))
  }, [sampleLines])

  // Build tree structure
  const buildTree = (samples: { stack: string; count: number }[]): FlameNode => {
    const root: FlameNode = { name: 'root', value: 0, children: [] }
    
    samples.forEach(({ stack, count }) => {
      const parts = stack.split(';')
      let current = root
      
      parts.forEach(part => {
        let child = current.children.find(c => c.name === part)
        if (!child) {
          child = { name: part, value: 0, children: [] }
          current.children.push(child)
        }
        child.value += count
        current = child
      })
    })
    
    // Calculate root value
    root.value = root.children.reduce((sum, child) => sum + child.value, 0)
    
    return root
  }

  // Sort children alphabetically
  const sortTree = (node: FlameNode): FlameNode => {
    return {
      ...node,
      children: node.children
        .map(sortTree)
        .sort((a, b) => a.name.localeCompare(b.name))
    }
  }

  const tree = useMemo(() => buildTree(foldedSamples), [foldedSamples])
  const sortedTree = useMemo(() => sortTree(tree), [tree])
  
  const displayTree = step >= 3 ? sortedTree : tree
  const totalSamples = sampleLines.length

  const nextStep = async () => {
    if (step < 3) {
      setIsAnimating(true)
      await new Promise(r => setTimeout(r, 500))
      setStep(s => s + 1)
      setIsAnimating(false)
    }
  }

  const prevStep = () => {
    if (step > 0) {
      setStep(s => s - 1)
    }
  }

  const reset = () => {
    setStep(0)
    setRawSamples(initialSamples)
  }

  // Render flame graph recursively
  const renderFlameGraph = (node: FlameNode, depth: number, startX: number, totalWidth: number): JSX.Element[] => {
    const elements: JSX.Element[] = []
    const frameHeight = 24
    const padding = 1
    
    if (node.name !== 'root') {
      const width = (node.value / totalSamples) * totalWidth
      const colors = [
        '#ff6b35', '#ff8c42', '#ffa94d', '#ffc078', 
        '#ffd43b', '#ffe066', '#e8590c', '#fd7e14'
      ]
      const colorIndex = Math.abs(node.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length
      
      elements.push(
        <motion.g
          key={`${node.name}-${depth}-${startX}`}
          initial={step === 2 ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, delay: depth * 0.1 }}
        >
          <rect
            x={startX + padding}
            y={200 - (depth * (frameHeight + 2))}
            width={Math.max(0, width - padding * 2)}
            height={frameHeight}
            fill={colors[colorIndex]}
            rx={3}
            className="flame-frame"
          />
          {width > 40 && (
            <text
              x={startX + width / 2}
              y={200 - (depth * (frameHeight + 2)) + frameHeight / 2 + 4}
              textAnchor="middle"
              fontSize="11"
              fill="#000"
              fontFamily="var(--font-mono)"
              fontWeight="600"
            >
              {node.name}
            </text>
          )}
        </motion.g>
      )
    }
    
    let childX = startX
    node.children.forEach(child => {
      const childWidth = (child.value / totalSamples) * totalWidth
      elements.push(...renderFlameGraph(child, depth + 1, childX, totalWidth))
      childX += childWidth
    })
    
    return elements
  }

  const stepDescriptions = [
    {
      title: 'Step 1: Raw Stack Samples',
      description: 'These are the stack traces captured by the profiler. Each line represents one sample—the call stack at the moment the profiler sampled.',
    },
    {
      title: 'Step 2: Fold Identical Stacks',
      description: 'Identical stack traces are merged together, with a count of how many times each appeared. This is the "folded" format used by Brendan Gregg\'s tools.',
    },
    {
      title: 'Step 3: Build the Flame Graph',
      description: 'Each unique stack becomes a tower. The width is proportional to the sample count. Frames stack on top of their callers.',
    },
    {
      title: 'Step 4: Sort Siblings Alphabetically',
      description: 'Sibling frames are sorted alphabetically. This ensures the same function always appears in the same horizontal position, making patterns easier to spot.',
    },
  ]

  return (
    <div className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="section-header">
          <span className="section-number">Section 03</span>
          <h2 className="section-title">Building Flame Graphs</h2>
          <p className="section-subtitle">
            This is the key section. Most people see flame graphs without understanding 
            how they're built. Let's construct one from raw samples.
          </p>
        </div>

        {/* Step Indicators */}
        <div className="step-navigation">
          <div className="step-indicators">
            {[0, 1, 2, 3].map((s) => (
              <div key={s} className="step-item">
                <div 
                  className={`step-indicator ${step === s ? 'active' : ''} ${step > s ? 'completed' : ''}`}
                  onClick={() => !isAnimating && setStep(s)}
                >
                  {step > s ? '✓' : s + 1}
                </div>
                {s < 3 && <div className={`step-connector ${step > s ? 'active' : ''}`} />}
              </div>
            ))}
          </div>
          <div className="step-info">
            <h3>{stepDescriptions[step].title}</h3>
            <p>{stepDescriptions[step].description}</p>
          </div>
        </div>

        {/* Main Demo Container */}
        <div className="demo-container">
          <div className="demo-header">
            <h3 className="demo-title">🔥 Build-a-FlameGraph</h3>
            <div className="demo-controls">
              <Button variant="ghost" onClick={reset} disabled={isAnimating}>
                Reset
              </Button>
              <Button 
                variant="secondary" 
                onClick={prevStep} 
                disabled={step === 0 || isAnimating}
              >
                ← Back
              </Button>
              <Button 
                onClick={nextStep} 
                disabled={step === 3 || isAnimating}
              >
                {step === 3 ? 'Complete!' : 'Next Step →'}
              </Button>
            </div>
          </div>

          <div className="demo-content build-layout">
            {/* Left Panel: Input/Folded */}
            <div className="input-panel">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="raw"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="input-section"
                  >
                    <div className="panel-header">
                      <span className="panel-title">📄 Raw Stack Samples (editable)</span>
                      <span className="sample-count">{sampleLines.length} samples</span>
                    </div>
                    <textarea
                      className="samples-textarea"
                      value={rawSamples}
                      onChange={(e) => setRawSamples(e.target.value)}
                      spellCheck={false}
                    />
                    <p className="input-hint">
                      Format: function1;function2;function3 (one stack per line)
                    </p>
                  </motion.div>
                )}

                {step >= 1 && (
                  <motion.div
                    key="folded"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="folded-section"
                  >
                    <div className="panel-header">
                      <span className="panel-title">📊 Folded Stack Format</span>
                      <span className="sample-count">{foldedSamples.length} unique stacks</span>
                    </div>
                    <div className="folded-list">
                      {foldedSamples
                        .sort((a, b) => b.count - a.count)
                        .map(({ stack, count }, i) => (
                          <motion.div
                            key={stack}
                            className="folded-row"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <span className="folded-stack">{stack}</span>
                            <span className="folded-count">{count}</span>
                          </motion.div>
                        ))}
                    </div>
                    <div className="format-note">
                      <code>stack;trace;path  count</code>
                      <p>This is the format used by flamegraph.pl</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Panel: Flame Graph */}
            <div className="flamegraph-panel">
              <div className="panel-header">
                <span className="panel-title">🔥 Flame Graph</span>
                {step >= 3 && <span className="sorted-badge">Sorted ✓</span>}
              </div>
              <div className="flamegraph-container">
                {step >= 2 ? (
                  <svg 
                    viewBox="0 0 500 220" 
                    className="flamegraph-svg"
                    preserveAspectRatio="xMidYMax meet"
                  >
                    {/* Base line */}
                    <line 
                      x1="0" y1="200" x2="500" y2="200" 
                      stroke="var(--color-border-default)" 
                      strokeWidth="1"
                    />
                    {renderFlameGraph(displayTree, 0, 0, 500)}
                  </svg>
                ) : (
                  <div className="flamegraph-placeholder">
                    <p>Complete steps 1 and 2 to build the flame graph</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Key Takeaways */}
        <div className="takeaways-section">
          <h3>💡 Why This Matters</h3>
          <div className="takeaways-grid">
            <Card>
              <h4>X-axis is NOT time</h4>
              <p>
                The x-axis is alphabetically sorted. The same function always 
                appears in the same horizontal position across different stacks. 
                This is why flame graphs look different from flame charts.
              </p>
            </Card>
            <Card>
              <h4>Width = Sample Count</h4>
              <p>
                Wider frames appeared more often in samples. More samples = 
                more time spent. This is the core insight: <strong>wide = slow</strong>.
              </p>
            </Card>
            <Card>
              <h4>Stacks Merge</h4>
              <p>
                The folding step merges identical stacks. This is why flame graphs 
                show the "big picture"—similar code paths combine into wider frames.
              </p>
            </Card>
          </div>
        </div>

        {/* Try It Yourself */}
        <Card className="try-it-card">
          <h3>🧪 Try It Yourself</h3>
          <p>
            Go back to Step 1 and edit the sample data. Add more samples of 
            <code> main;processData;parseJSON</code> and watch the flame graph 
            change. See how the width grows?
          </p>
          <Button variant="secondary" onClick={reset}>
            ← Go Back to Step 1
          </Button>
        </Card>
      </motion.div>

      <style>{`
        .step-navigation {
          margin-bottom: var(--space-8);
          text-align: center;
        }

        .step-indicators {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: var(--space-6);
        }

        .step-item {
          display: flex;
          align-items: center;
        }

        .step-indicator {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          font-weight: 600;
          background: var(--color-bg-tertiary);
          color: var(--color-text-tertiary);
          border: 2px solid var(--color-border-default);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .step-indicator:hover {
          border-color: var(--color-text-secondary);
        }

        .step-indicator.active {
          background: var(--color-accent-primary);
          border-color: var(--color-accent-primary);
          color: var(--color-bg-primary);
        }

        .step-indicator.completed {
          background: var(--color-success);
          border-color: var(--color-success);
          color: white;
        }

        .step-connector {
          width: 60px;
          height: 2px;
          background: var(--color-border-default);
          margin: 0 var(--space-2);
        }

        .step-connector.active {
          background: var(--color-success);
        }

        .step-info h3 {
          margin-bottom: var(--space-2);
          color: var(--color-accent-primary);
        }

        .step-info p {
          max-width: 600px;
          margin: 0 auto;
        }

        .build-layout {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: var(--space-6);
          min-height: 400px;
        }

        .input-panel {
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-3);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md) var(--radius-md) 0 0;
          border-bottom: 1px solid var(--color-border-muted);
        }

        .panel-title {
          font-weight: 600;
          font-size: var(--text-sm);
        }

        .sample-count {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          color: var(--color-success);
        }

        .sorted-badge {
          font-size: var(--text-xs);
          color: var(--color-success);
          background: var(--color-success-subtle);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm);
        }

        .samples-textarea {
          flex: 1;
          min-height: 250px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-default);
          border-top: none;
          border-radius: 0 0 var(--radius-md) var(--radius-md);
          padding: var(--space-4);
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          color: var(--color-text-primary);
          resize: none;
          line-height: 1.6;
        }

        .samples-textarea:focus {
          outline: none;
          border-color: var(--color-accent-primary);
        }

        .input-hint {
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
          margin-top: var(--space-2);
        }

        .folded-section {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .folded-list {
          flex: 1;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-default);
          border-top: none;
          padding: var(--space-4);
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          overflow-y: auto;
        }

        .folded-row {
          display: flex;
          justify-content: space-between;
          padding: var(--space-2);
          border-radius: var(--radius-sm);
          margin-bottom: var(--space-1);
          background: var(--color-bg-tertiary);
        }

        .folded-stack {
          color: var(--color-text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .folded-count {
          color: var(--color-flame-warm);
          font-weight: 600;
          margin-left: var(--space-4);
        }

        .format-note {
          margin-top: var(--space-3);
          padding: var(--space-3);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          font-size: var(--text-xs);
        }

        .format-note code {
          display: block;
          margin-bottom: var(--space-1);
        }

        .format-note p {
          color: var(--color-text-tertiary);
          margin: 0;
        }

        .flamegraph-panel {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .flamegraph-container {
          padding: var(--space-4);
          min-height: 300px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .flamegraph-svg {
          width: 100%;
          height: auto;
        }

        .flamegraph-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 250px;
          color: var(--color-text-tertiary);
        }

        .flame-frame {
          cursor: pointer;
          transition: opacity var(--transition-fast);
        }

        .flame-frame:hover {
          opacity: 0.8;
        }

        .takeaways-section {
          margin-top: var(--space-12);
        }

        .takeaways-section h3 {
          text-align: center;
          margin-bottom: var(--space-6);
        }

        .takeaways-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-6);
        }

        .takeaways-grid h4 {
          color: var(--color-flame-warm);
          margin-bottom: var(--space-2);
        }

        .takeaways-grid p {
          font-size: var(--text-sm);
        }

        .try-it-card {
          margin-top: var(--space-8);
          text-align: center;
        }

        .try-it-card h3 {
          margin-bottom: var(--space-3);
        }

        .try-it-card p {
          margin-bottom: var(--space-4);
        }

        @media (max-width: 1024px) {
          .build-layout {
            grid-template-columns: 1fr;
          }

          .takeaways-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
