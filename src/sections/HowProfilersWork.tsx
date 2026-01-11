import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Card, Slider, Toggle } from '../components/UI'

interface Sample {
  id: number
  stack: string[]
  timestamp: number
}

const sampleCode = [
  { line: 1, code: 'function main() {' },
  { line: 2, code: '  processData(data);' },
  { line: 3, code: '}' },
  { line: 4, code: '' },
  { line: 5, code: 'function processData(data) {' },
  { line: 6, code: '  for (let item of data) {' },
  { line: 7, code: '    parseJSON(item);' },
  { line: 8, code: '    validate(item);' },
  { line: 9, code: '  }' },
  { line: 10, code: '}' },
  { line: 11, code: '' },
  { line: 12, code: 'function parseJSON(item) {' },
  { line: 13, code: '  // Heavy parsing work...' },
  { line: 14, code: '  return JSON.parse(item);' },
  { line: 15, code: '}' },
  { line: 16, code: '' },
  { line: 17, code: 'function validate(item) {' },
  { line: 18, code: '  // Quick validation' },
  { line: 19, code: '  return item.valid;' },
  { line: 20, code: '}' },
]

// Simulation of code execution with varying time spent in each function
const executionSequence = [
  { line: 1, stack: ['main'], duration: 100 },
  { line: 2, stack: ['main'], duration: 50 },
  { line: 5, stack: ['main', 'processData'], duration: 50 },
  { line: 6, stack: ['main', 'processData'], duration: 50 },
  { line: 7, stack: ['main', 'processData'], duration: 50 },
  { line: 12, stack: ['main', 'processData', 'parseJSON'], duration: 400 },
  { line: 13, stack: ['main', 'processData', 'parseJSON'], duration: 400 },
  { line: 14, stack: ['main', 'processData', 'parseJSON'], duration: 400 },
  { line: 15, stack: ['main', 'processData', 'parseJSON'], duration: 100 },
  { line: 8, stack: ['main', 'processData'], duration: 50 },
  { line: 17, stack: ['main', 'processData', 'validate'], duration: 100 },
  { line: 18, stack: ['main', 'processData', 'validate'], duration: 50 },
  { line: 19, stack: ['main', 'processData', 'validate'], duration: 50 },
  { line: 20, stack: ['main', 'processData', 'validate'], duration: 50 },
  { line: 6, stack: ['main', 'processData'], duration: 50 },
  // Loop iteration 2
  { line: 7, stack: ['main', 'processData'], duration: 50 },
  { line: 12, stack: ['main', 'processData', 'parseJSON'], duration: 400 },
  { line: 13, stack: ['main', 'processData', 'parseJSON'], duration: 400 },
  { line: 14, stack: ['main', 'processData', 'parseJSON'], duration: 400 },
  { line: 8, stack: ['main', 'processData'], duration: 50 },
  { line: 17, stack: ['main', 'processData', 'validate'], duration: 100 },
  { line: 19, stack: ['main', 'processData', 'validate'], duration: 50 },
  { line: 9, stack: ['main', 'processData'], duration: 50 },
  { line: 10, stack: ['main', 'processData'], duration: 50 },
  { line: 3, stack: ['main'], duration: 100 },
]

export default function HowProfilersWork() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentLine, setCurrentLine] = useState<number | null>(null)
  const [currentStack, setCurrentStack] = useState<string[]>([])
  const [samples, setSamples] = useState<Sample[]>([])
  const [samplingRate, setSamplingRate] = useState(100) // ms between samples
  const [executionSpeed, setExecutionSpeed] = useState(50) // ms per step
  const [showFlash, setShowFlash] = useState(false)
  const [profilerType, setProfilerType] = useState<'sampling' | 'instrumentation'>('sampling')
  
  const executionIndexRef = useRef(0)
  const sampleIdRef = useRef(0)
  const lastSampleTimeRef = useRef(0)
  const totalTimeRef = useRef(0)

  const resetSimulation = () => {
    setIsRunning(false)
    setCurrentLine(null)
    setCurrentStack([])
    setSamples([])
    executionIndexRef.current = 0
    sampleIdRef.current = 0
    lastSampleTimeRef.current = 0
    totalTimeRef.current = 0
  }

  const startSimulation = () => {
    resetSimulation()
    setIsRunning(true)
  }

  useEffect(() => {
    if (!isRunning) return

    const runStep = () => {
      if (executionIndexRef.current >= executionSequence.length) {
        setIsRunning(false)
        return
      }

      const step = executionSequence[executionIndexRef.current]
      setCurrentLine(step.line)
      setCurrentStack(step.stack)

      // For sampling profiler: capture sample at intervals
      if (profilerType === 'sampling') {
        totalTimeRef.current += executionSpeed
        if (totalTimeRef.current - lastSampleTimeRef.current >= samplingRate) {
          setShowFlash(true)
          setTimeout(() => setShowFlash(false), 100)
          
          setSamples(prev => [...prev, {
            id: sampleIdRef.current++,
            stack: [...step.stack],
            timestamp: totalTimeRef.current
          }])
          lastSampleTimeRef.current = totalTimeRef.current
        }
      } 
      // For instrumentation: capture on every function entry/exit
      else {
        const prevStack = executionIndexRef.current > 0 
          ? executionSequence[executionIndexRef.current - 1].stack 
          : []
        
        if (step.stack.length !== prevStack.length || 
            step.stack[step.stack.length - 1] !== prevStack[prevStack.length - 1]) {
          setSamples(prev => [...prev, {
            id: sampleIdRef.current++,
            stack: [...step.stack],
            timestamp: totalTimeRef.current
          }])
        }
        totalTimeRef.current += executionSpeed
      }

      executionIndexRef.current++
    }

    const interval = setInterval(runStep, executionSpeed)
    return () => clearInterval(interval)
  }, [isRunning, samplingRate, executionSpeed, profilerType])

  // Fold samples into counts
  const foldedSamples = samples.reduce((acc, sample) => {
    const key = sample.stack.join(';')
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sortedFolded = Object.entries(foldedSamples)
    .sort((a, b) => b[1] - a[1])

  return (
    <div className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="section-header">
          <span className="section-number">Section 02</span>
          <h2 className="section-title">How Profilers Work</h2>
          <p className="section-subtitle">
            Before you can understand flame graphs, you need to understand 
            where the data comes from. Let's watch a profiler in action.
          </p>
        </div>

        {/* Profiler Type Toggle */}
        <div className="profiler-toggle-section">
          <Toggle
            options={[
              { value: 'sampling', label: 'Sampling Profiler' },
              { value: 'instrumentation', label: 'Instrumentation' },
            ]}
            value={profilerType}
            onChange={(v) => {
              setProfilerType(v as 'sampling' | 'instrumentation')
              resetSimulation()
            }}
          />
        </div>

        {/* Explanation Cards */}
        <div className="explanation-grid">
          <Card className={`explanation-card ${profilerType === 'sampling' ? 'active' : ''}`}>
            <h4>⏱️ Sampling Profiler</h4>
            <p>
              Periodically captures the call stack (e.g., every 10ms). 
              Low overhead (~2-5%), but may miss very short functions.
            </p>
            <ul className="pros-cons">
              <li className="pro">✓ Low overhead</li>
              <li className="pro">✓ Safe for production</li>
              <li className="con">✗ Statistical, not exact</li>
              <li className="con">✗ May miss short functions</li>
            </ul>
          </Card>
          
          <Card className={`explanation-card ${profilerType === 'instrumentation' ? 'active' : ''}`}>
            <h4>📊 Instrumentation Profiler</h4>
            <p>
              Inserts code at every function entry/exit. Exact timings, 
              but can slow the program by 10-100x.
            </p>
            <ul className="pros-cons">
              <li className="pro">✓ Exact measurements</li>
              <li className="pro">✓ Catches all functions</li>
              <li className="con">✗ High overhead (10-100x)</li>
              <li className="con">✗ Changes behavior</li>
            </ul>
          </Card>
        </div>

        {/* Interactive Demo */}
        <div className="demo-container">
          <div className="demo-header">
            <h3 className="demo-title">
              {profilerType === 'sampling' 
                ? '🔬 Watch a Sampling Profiler Capture Data' 
                : '📝 Watch Instrumentation Record Every Call'}
            </h3>
            <div className="demo-controls">
              {!isRunning ? (
                <Button onClick={startSimulation}>
                  ▶ Run Simulation
                </Button>
              ) : (
                <Button variant="secondary" onClick={resetSimulation}>
                  ⏹ Reset
                </Button>
              )}
            </div>
          </div>

          {profilerType === 'sampling' && (
            <div className="slider-controls">
              <Slider
                min={50}
                max={300}
                value={samplingRate}
                onChange={setSamplingRate}
                label="Sampling Interval"
                formatValue={(v) => `${v}ms`}
              />
              <Slider
                min={20}
                max={100}
                value={executionSpeed}
                onChange={setExecutionSpeed}
                label="Execution Speed"
                formatValue={(v) => `${v}ms/step`}
              />
            </div>
          )}

          <div className="demo-content simulation-layout">
            {/* Code Panel */}
            <div className="code-panel">
              <div className="panel-header">
                <span className="panel-title">📄 Code Execution</span>
                {currentLine && (
                  <span className="line-indicator">Line {currentLine}</span>
                )}
              </div>
              <div className="code-block">
                <div className="code-block-content">
                  {sampleCode.map((line) => (
                    <div 
                      key={line.line}
                      className={`code-line ${currentLine === line.line ? 'highlighted executing' : ''}`}
                    >
                      <span className="code-line-number">{line.line}</span>
                      <span className="code-line-content">{line.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Call Stack Panel */}
            <div className="stack-panel">
              <div className="panel-header">
                <span className="panel-title">📚 Call Stack</span>
                {showFlash && profilerType === 'sampling' && (
                  <span className="sample-flash">📸 SAMPLE!</span>
                )}
              </div>
              <div className="stack-visualization">
                <AnimatePresence>
                  {currentStack.map((frame, index) => (
                    <motion.div
                      key={`${frame}-${index}`}
                      className="stack-frame"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      style={{ 
                        background: `hsl(${30 + index * 20}, 80%, ${50 - index * 5}%)` 
                      }}
                    >
                      {frame}()
                    </motion.div>
                  ))}
                </AnimatePresence>
                {currentStack.length === 0 && !isRunning && (
                  <div className="stack-empty">
                    Stack is empty. Run simulation to see calls.
                  </div>
                )}
              </div>
            </div>

            {/* Samples Panel */}
            <div className="samples-panel">
              <div className="panel-header">
                <span className="panel-title">📊 Captured Samples</span>
                <span className="sample-count">{samples.length} samples</span>
              </div>
              <div className="samples-list">
                {samples.length === 0 ? (
                  <div className="samples-empty">
                    {profilerType === 'sampling' 
                      ? 'Waiting for samples...' 
                      : 'Waiting for function calls...'}
                  </div>
                ) : (
                  <div className="folded-samples">
                    <div className="folded-header">Folded Stack Format:</div>
                    {sortedFolded.map(([stack, count]) => (
                      <div key={stack} className="folded-line">
                        <span className="folded-stack">{stack}</span>
                        <span className="folded-count">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="insights-section">
          <h3>Key Insights</h3>
          <div className="insights-grid">
            <Card>
              <h4>🎲 Profiling is Statistical</h4>
              <p>
                Sampling profilers capture snapshots at intervals. More time 
                in a function = more samples. This statistical approach gives 
                us a picture of where time is <em>typically</em> spent.
              </p>
            </Card>
            <Card>
              <h4>📈 Samples → Flame Graph</h4>
              <p>
                Each captured stack sample becomes data for the flame graph. 
                The width of each frame represents how often that function 
                appeared in samples—which correlates with time spent.
              </p>
            </Card>
            <Card>
              <h4>⚠️ Profiling Artifacts</h4>
              <p>
                <strong>Observer effect:</strong> Profiling changes behavior.
                <strong> Inlining:</strong> Compiler may remove function boundaries.
                <strong> Frame pointers:</strong> Some stacks appear truncated.
              </p>
            </Card>
          </div>
        </div>

        {/* Next Section Hint */}
        <motion.div
          className="next-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p>Now that you understand how samples are captured...</p>
          <p className="next-highlight">Let's see how they become a flame graph ↓</p>
        </motion.div>
      </motion.div>

      <style>{`
        .profiler-toggle-section {
          display: flex;
          justify-content: center;
          margin-bottom: var(--space-8);
        }

        .explanation-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-6);
          margin-bottom: var(--space-8);
        }

        .explanation-card {
          opacity: 0.6;
          transition: all var(--transition-base);
        }

        .explanation-card.active {
          opacity: 1;
          border-color: var(--color-accent-primary);
        }

        .explanation-card h4 {
          margin-bottom: var(--space-3);
        }

        .explanation-card p {
          margin-bottom: var(--space-4);
        }

        .pros-cons {
          list-style: none;
          font-size: var(--text-sm);
        }

        .pros-cons li {
          padding: var(--space-1) 0;
        }

        .pros-cons .pro {
          color: var(--color-success);
        }

        .pros-cons .con {
          color: var(--color-error);
        }

        .demo-controls {
          display: flex;
          gap: var(--space-3);
        }

        .slider-controls {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-6);
          margin-bottom: var(--space-6);
          padding: var(--space-4);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-lg);
        }

        .simulation-layout {
          display: grid;
          grid-template-columns: 1fr 200px 1fr;
          gap: var(--space-4);
          min-height: 400px;
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

        .line-indicator {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          color: var(--color-accent-primary);
        }

        .code-panel .code-block {
          border-radius: 0 0 var(--radius-md) var(--radius-md);
          max-height: 350px;
          overflow-y: auto;
        }

        .code-line.executing {
          background: rgba(88, 166, 255, 0.2) !important;
          position: relative;
        }

        .code-line.executing::before {
          content: '▶';
          position: absolute;
          left: -20px;
          color: var(--color-accent-primary);
        }

        .stack-panel {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .stack-visualization {
          padding: var(--space-4);
          display: flex;
          flex-direction: column-reverse;
          gap: var(--space-2);
          min-height: 300px;
        }

        .stack-frame {
          padding: var(--space-3);
          border-radius: var(--radius-md);
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          color: var(--color-bg-primary);
          font-weight: 600;
          text-align: center;
        }

        .stack-empty {
          color: var(--color-text-tertiary);
          font-size: var(--text-sm);
          text-align: center;
          padding: var(--space-8);
        }

        .sample-flash {
          background: var(--color-flame-warm);
          color: var(--color-bg-primary);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm);
          font-size: var(--text-xs);
          font-weight: 700;
          animation: flash 0.3s ease-out;
        }

        @keyframes flash {
          0% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        .samples-panel {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .sample-count {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
          color: var(--color-success);
        }

        .samples-list {
          padding: var(--space-4);
          max-height: 350px;
          overflow-y: auto;
        }

        .samples-empty {
          color: var(--color-text-tertiary);
          font-size: var(--text-sm);
          text-align: center;
          padding: var(--space-8);
        }

        .folded-samples {
          font-family: var(--font-mono);
          font-size: var(--text-xs);
        }

        .folded-header {
          color: var(--color-text-tertiary);
          margin-bottom: var(--space-2);
          font-size: var(--text-xs);
        }

        .folded-line {
          display: flex;
          justify-content: space-between;
          padding: var(--space-1) 0;
          border-bottom: 1px solid var(--color-border-muted);
        }

        .folded-stack {
          color: var(--color-text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          margin-right: var(--space-2);
        }

        .folded-count {
          color: var(--color-accent-primary);
          font-weight: 600;
        }

        .insights-section {
          margin-top: var(--space-12);
        }

        .insights-section h3 {
          text-align: center;
          margin-bottom: var(--space-6);
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-6);
        }

        .insights-grid h4 {
          margin-bottom: var(--space-2);
        }

        .insights-grid p {
          font-size: var(--text-sm);
        }

        .next-section {
          text-align: center;
          margin-top: var(--space-12);
          padding: var(--space-8);
        }

        .next-section p {
          color: var(--color-text-tertiary);
        }

        .next-highlight {
          font-size: var(--text-xl);
          color: var(--color-accent-primary) !important;
          font-weight: 600;
          margin-top: var(--space-2);
        }

        @media (max-width: 1024px) {
          .simulation-layout {
            grid-template-columns: 1fr;
          }

          .explanation-grid,
          .insights-grid {
            grid-template-columns: 1fr;
          }

          .slider-controls {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
