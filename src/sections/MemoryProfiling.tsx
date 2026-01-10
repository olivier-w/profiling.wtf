import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Card } from '../components/UI'

interface HeapObject {
  id: number
  name: string
  size: number
  x: number
  y: number
  references: number[]
  isRoot?: boolean
  isReachable?: boolean
  isMarked?: boolean
}

const initialHeap: HeapObject[] = [
  { id: 0, name: 'root', size: 1, x: 0, y: 0, references: [1, 2], isRoot: true },
  { id: 1, name: 'userA', size: 2, x: 1, y: 0, references: [3] },
  { id: 2, name: 'userB', size: 2, x: 2, y: 0, references: [4] },
  { id: 3, name: 'data1', size: 3, x: 0, y: 1, references: [] },
  { id: 4, name: 'data2', size: 3, x: 1, y: 1, references: [5] },
  { id: 5, name: 'shared', size: 2, x: 2, y: 1, references: [] },
  { id: 6, name: 'orphan', size: 4, x: 3, y: 0, references: [7] },
  { id: 7, name: 'leaked', size: 3, x: 3, y: 1, references: [] },
]

export default function MemoryProfiling() {
  const [heap, setHeap] = useState<HeapObject[]>(initialHeap)
  const [gcPhase, setGcPhase] = useState<'idle' | 'mark' | 'sweep' | 'done'>('idle')
  const [memoryFreed, setMemoryFreed] = useState(0)

  const resetGC = () => {
    setHeap(initialHeap.map(obj => ({ ...obj, isMarked: false, isReachable: false })))
    setGcPhase('idle')
    setMemoryFreed(0)
  }

  const markPhase = async () => {
    setGcPhase('mark')
    
    const marked = new Set<number>()
    const queue = [0] // Start from root
    
    while (queue.length > 0) {
      const id = queue.shift()!
      if (marked.has(id)) continue
      marked.add(id)
      
      setHeap(prev => prev.map(obj => 
        obj.id === id ? { ...obj, isMarked: true, isReachable: true } : obj
      ))
      
      await new Promise(r => setTimeout(r, 500))
      
      const obj = heap.find(o => o.id === id)
      if (obj) {
        queue.push(...obj.references)
      }
    }
  }

  const sweepPhase = async () => {
    setGcPhase('sweep')
    
    let freed = 0
    for (const obj of heap) {
      if (!obj.isMarked && !obj.isRoot) {
        freed += obj.size
        await new Promise(r => setTimeout(r, 300))
        setHeap(prev => prev.filter(o => o.id !== obj.id))
      }
    }
    
    setMemoryFreed(freed)
    setGcPhase('done')
  }

  const runGC = async () => {
    resetGC()
    await new Promise(r => setTimeout(r, 500))
    await markPhase()
    await new Promise(r => setTimeout(r, 500))
    await sweepPhase()
  }

  const getCellColor = (obj: HeapObject) => {
    if (obj.isRoot) return 'var(--color-accent-primary)'
    if (gcPhase === 'sweep' && !obj.isMarked) return 'var(--color-error)'
    if (obj.isMarked) return 'var(--color-success)'
    return 'var(--color-bg-elevated)'
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
          <span className="section-number">Section 08</span>
          <h2 className="section-title">Memory Profiling</h2>
          <p className="section-subtitle">
            Understanding memory usage is just as important as CPU profiling. 
            Let's explore heap visualization and garbage collection.
          </p>
        </div>

        {/* Memory Concepts */}
        <div className="concepts-grid">
          <Card>
            <h4>📦 Shallow Size</h4>
            <p>
              The memory used by the object itself, not including 
              objects it references.
            </p>
            <code>Object header + own properties</code>
          </Card>
          <Card>
            <h4>🌳 Retained Size</h4>
            <p>
              Memory that would be freed if this object was GC'd, 
              including objects only reachable through it.
            </p>
            <code>Shallow size + exclusively referenced objects</code>
          </Card>
          <Card>
            <h4>🔗 Dominator Tree</h4>
            <p>
              Shows which objects "dominate" others—removing a dominator 
              frees all objects it exclusively holds.
            </p>
            <code>Used to find memory leak roots</code>
          </Card>
        </div>

        {/* GC Simulator */}
        <div className="demo-container">
          <div className="demo-header">
            <h3 className="demo-title">🗑️ Garbage Collection Simulator</h3>
            <div className="demo-controls">
              <Button 
                onClick={runGC} 
                disabled={gcPhase !== 'idle' && gcPhase !== 'done'}
              >
                {gcPhase === 'idle' ? 'Run GC' : gcPhase === 'done' ? 'Run Again' : 'Running...'}
              </Button>
              <Button variant="ghost" onClick={resetGC}>Reset</Button>
            </div>
          </div>

          <div className="gc-layout">
            {/* Heap Visualization */}
            <div className="heap-viz">
              <div className="heap-grid">
                <AnimatePresence>
                  {heap.map(obj => (
                    <motion.div
                      key={obj.id}
                      className="heap-object"
                      style={{
                        gridColumn: obj.x + 1,
                        gridRow: obj.y + 1,
                        backgroundColor: getCellColor(obj),
                        width: `${Math.min(100, obj.size * 30)}px`,
                        height: `${Math.min(80, obj.size * 25)}px`,
                      }}
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ 
                        scale: gcPhase === 'sweep' && !obj.isMarked ? 0.5 : 1,
                        opacity: gcPhase === 'sweep' && !obj.isMarked ? 0.5 : 1,
                      }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="obj-name">{obj.name}</span>
                      <span className="obj-size">{obj.size}KB</span>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Reference Lines (simplified) */}
                <svg className="reference-lines">
                  {heap.flatMap(obj => 
                    obj.references.map(refId => {
                      const target = heap.find(o => o.id === refId)
                      if (!target) return null
                      return (
                        <line
                          key={`${obj.id}-${refId}`}
                          x1={obj.x * 120 + 50}
                          y1={obj.y * 100 + 40}
                          x2={target.x * 120 + 50}
                          y2={target.y * 100 + 40}
                          stroke={obj.isMarked ? 'var(--color-success)' : 'var(--color-border-default)'}
                          strokeWidth={2}
                          markerEnd="url(#arrowhead)"
                        />
                      )
                    })
                  )}
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-text-tertiary)" />
                    </marker>
                  </defs>
                </svg>
              </div>
            </div>

            {/* GC Status */}
            <div className="gc-status">
              <h4>GC Phase</h4>
              <div className="phase-indicator">
                <div className={`phase ${gcPhase === 'idle' ? 'active' : gcPhase !== 'idle' ? 'done' : ''}`}>
                  1. Idle
                </div>
                <div className={`phase ${gcPhase === 'mark' ? 'active' : gcPhase === 'sweep' || gcPhase === 'done' ? 'done' : ''}`}>
                  2. Mark
                </div>
                <div className={`phase ${gcPhase === 'sweep' ? 'active' : gcPhase === 'done' ? 'done' : ''}`}>
                  3. Sweep
                </div>
                <div className={`phase ${gcPhase === 'done' ? 'active' : ''}`}>
                  4. Done
                </div>
              </div>

              <div className="gc-legend">
                <div className="legend-item">
                  <span className="legend-color" style={{ background: 'var(--color-accent-primary)' }} />
                  <span>Root object</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ background: 'var(--color-success)' }} />
                  <span>Reachable (kept)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ background: 'var(--color-error)' }} />
                  <span>Unreachable (freed)</span>
                </div>
              </div>

              {gcPhase === 'done' && (
                <motion.div 
                  className="gc-result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="freed-label">Memory Freed:</span>
                  <span className="freed-value">{memoryFreed} KB</span>
                </motion.div>
              )}
            </div>
          </div>

          <div className="gc-explanation">
            <p>
              <strong>Mark & Sweep:</strong> GC starts from root objects and marks 
              everything reachable. Unmarked objects (like "orphan" and "leaked" above) 
              are swept away, freeing memory.
            </p>
          </div>
        </div>

        {/* Memory Leak Patterns */}
        <div className="leaks-section">
          <h3>🕳️ Common Memory Leak Patterns</h3>
          <div className="leaks-grid">
            <Card>
              <h4>Event Listeners</h4>
              <pre>{`// Leak: listener never removed
element.addEventListener('click', handler);
// component unmounts but listener stays

// Fix: always cleanup
return () => element.removeEventListener('click', handler);`}</pre>
            </Card>
            <Card>
              <h4>Closures Holding References</h4>
              <pre>{`// Leak: closure captures large object
const bigData = new Array(1000000);
setInterval(() => {
  console.log(bigData.length);
}, 1000);
// bigData can never be GC'd`}</pre>
            </Card>
            <Card>
              <h4>Detached DOM Nodes</h4>
              <pre>{`// Leak: reference to removed element
const element = document.getElementById('x');
document.body.removeChild(element);
// element still in memory via reference`}</pre>
            </Card>
            <Card>
              <h4>Growing Arrays/Maps</h4>
              <pre>{`// Leak: cache grows forever
const cache = new Map();
function process(key, data) {
  cache.set(key, data);
  // never cleared!
}`}</pre>
            </Card>
          </div>
        </div>

        {/* Allocation Flame Graphs */}
        <Card className="allocation-section">
          <h3>📊 Allocation Flame Graphs</h3>
          <p>
            CPU flame graphs show <em>where time is spent</em>. 
            Allocation flame graphs show <em>where memory is allocated</em>.
          </p>
          <p>
            Same visualization, different metric. Use them to find:
          </p>
          <ul>
            <li>Functions that allocate the most memory</li>
            <li>Unexpected allocation hot spots</li>
            <li>Opportunities for object pooling or reuse</li>
          </ul>
        </Card>
      </motion.div>

      <style>{`
        .concepts-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-4);
          margin-bottom: var(--space-8);
        }

        .concepts-grid h4 {
          margin-bottom: var(--space-2);
        }

        .concepts-grid p {
          font-size: var(--text-sm);
          margin-bottom: var(--space-3);
        }

        .concepts-grid code {
          font-size: var(--text-xs);
        }

        .gc-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: var(--space-6);
        }

        .heap-viz {
          position: relative;
          min-height: 250px;
        }

        .heap-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: var(--space-4);
          position: relative;
          padding: var(--space-4);
        }

        .heap-object {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          color: white;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          z-index: 1;
        }

        .obj-name {
          font-weight: 600;
        }

        .obj-size {
          font-size: var(--text-xs);
          opacity: 0.8;
        }

        .reference-lines {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .gc-status {
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
        }

        .gc-status h4 {
          margin-bottom: var(--space-4);
        }

        .phase-indicator {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-bottom: var(--space-6);
        }

        .phase {
          padding: var(--space-2) var(--space-3);
          background: var(--color-bg-elevated);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          color: var(--color-text-tertiary);
          transition: all var(--transition-fast);
        }

        .phase.active {
          background: var(--color-accent-primary);
          color: white;
        }

        .phase.done {
          color: var(--color-success);
        }

        .gc-legend {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-sm);
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: var(--radius-sm);
        }

        .gc-result {
          background: var(--color-success-subtle);
          border: 1px solid var(--color-success);
          border-radius: var(--radius-md);
          padding: var(--space-3);
          text-align: center;
        }

        .freed-label {
          display: block;
          font-size: var(--text-xs);
          color: var(--color-text-secondary);
        }

        .freed-value {
          font-family: var(--font-mono);
          font-size: var(--text-xl);
          font-weight: 700;
          color: var(--color-success);
        }

        .gc-explanation {
          margin-top: var(--space-4);
          padding: var(--space-3);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
        }

        .leaks-section {
          margin-top: var(--space-12);
        }

        .leaks-section h3 {
          text-align: center;
          margin-bottom: var(--space-6);
        }

        .leaks-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-4);
        }

        .leaks-grid h4 {
          margin-bottom: var(--space-3);
          color: var(--color-error);
        }

        .leaks-grid pre {
          font-size: var(--text-xs);
          margin: 0;
        }

        .allocation-section {
          margin-top: var(--space-8);
        }

        .allocation-section h3 {
          margin-bottom: var(--space-4);
        }

        .allocation-section ul {
          margin-top: var(--space-3);
          padding-left: var(--space-6);
        }

        .allocation-section li {
          margin-bottom: var(--space-2);
          color: var(--color-text-secondary);
        }

        @media (max-width: 1024px) {
          .concepts-grid,
          .leaks-grid {
            grid-template-columns: 1fr;
          }

          .gc-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
