import { useState } from 'react'
import { motion } from 'motion/react'

interface PatternExample {
  id: string
  title: string
  description: string
  problem: {
    code: string
    language: string
  }
  solution: {
    code: string
    language: string
  }
  flameData: {
    frames: { name: string; width: number; time: string; isHot?: boolean }[]
    totalTime: string
  }
}

const patterns: PatternExample[] = [
  {
    id: 'image-decode',
    title: 'Image Decoding on Main Thread',
    description: 'Large images block the UI while decoding. Users see frozen scrolling.',
    problem: {
      language: 'kotlin',
      code: `// Decoding blocks the main thread
val bitmap = BitmapFactory.decodeFile(path)
imageView.setImageBitmap(bitmap)  // 45ms freeze`,
    },
    solution: {
      language: 'kotlin',
      code: `// Decode off the main thread
withContext(Dispatchers.IO) {
    BitmapFactory.decodeFile(path)
}.let { imageView.setImageBitmap(it) }`,
    },
    flameData: {
      frames: [
        { name: 'onBindViewHolder', width: 100, time: '52ms' },
        { name: 'setImageBitmap', width: 90, time: '47ms' },
        { name: 'decodeFile', width: 85, time: '45ms', isHot: true },
      ],
      totalTime: '52ms',
    },
  },
  {
    id: 'layout-thrash',
    title: 'Layout Thrashing',
    description: 'Reading layout properties forces the browser to recalculate. Doing this in a loop multiplies the cost.',
    problem: {
      language: 'javascript',
      code: `// Each read forces a layout recalculation
items.forEach(item => {
  const width = container.offsetWidth  // read
  item.style.width = width + 'px'      // write → invalidates
})  // O(n²) layout calculations!`,
    },
    solution: {
      language: 'javascript',
      code: `// Batch reads, then writes
const width = container.offsetWidth  // one read
items.forEach(item => {
  item.style.width = width + 'px'    // writes only
})  // O(n) layout calculations`,
    },
    flameData: {
      frames: [
        { name: 'updateItems', width: 100, time: '89ms' },
        { name: 'layout', width: 45, time: '40ms', isHot: true },
        { name: 'layout', width: 40, time: '35ms', isHot: true },
        { name: 'layout', width: 10, time: '8ms', isHot: true },
      ],
      totalTime: '89ms',
    },
  },
  {
    id: 'main-thread-io',
    title: 'Main Thread I/O',
    description: 'Synchronous storage reads block the UI. Even "fast" reads add up.',
    problem: {
      language: 'javascript',
      code: `// Synchronous read blocks the main thread
const settings = localStorage.getItem('settings')
const user = localStorage.getItem('user')
const prefs = localStorage.getItem('prefs')
// 120ms of blocking I/O`,
    },
    solution: {
      language: 'javascript',
      code: `// Async with loading state
const [settings, user, prefs] = await Promise.all([
  AsyncStorage.getItem('settings'),
  AsyncStorage.getItem('user'),
  AsyncStorage.getItem('prefs'),
])`,
    },
    flameData: {
      frames: [
        { name: 'initApp', width: 100, time: '156ms' },
        { name: 'getItem("settings")', width: 35, time: '55ms', isHot: true },
        { name: 'getItem("user")', width: 28, time: '42ms', isHot: true },
        { name: 'getItem("prefs")', width: 15, time: '23ms', isHot: true },
      ],
      totalTime: '156ms',
    },
  },
]

function MiniFlameGraph({ data }: { data: PatternExample['flameData'] }) {
  const frameHeight = 24
  const padding = 2
  
  return (
    <div className="rounded-lg bg-[var(--bg)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">Profile view</span>
        <span className="font-mono text-xs text-[var(--text-muted)]">{data.totalTime} total</span>
      </div>
      <svg viewBox="0 0 300 110" className="w-full" style={{ height: 'auto' }}>
        {data.frames.map((frame, i) => {
          const y = i * (frameHeight + padding) + 4
          const width = (frame.width / 100) * 290
          const isHot = frame.isHot
          
          return (
            <g key={frame.name + i}>
              <rect
                x={4}
                y={y}
                width={width}
                height={frameHeight}
                rx={3}
                fill={isHot ? 'var(--accent)' : 'var(--surface)'}
                stroke={isHot ? 'var(--accent)' : 'var(--text-muted)'}
                strokeWidth={0.5}
                strokeOpacity={0.3}
              />
              <text
                x={10}
                y={y + frameHeight / 2 + 4}
                fontSize="10"
                fontFamily="var(--font-mono)"
                fill={isHot ? 'var(--bg)' : 'var(--text-muted)'}
              >
                {frame.name.length > 25 ? frame.name.slice(0, 22) + '...' : frame.name}
              </text>
              <text
                x={width - 4}
                y={y + frameHeight / 2 + 4}
                fontSize="9"
                fontFamily="var(--font-mono)"
                fill={isHot ? 'var(--bg)' : 'var(--text-muted)'}
                textAnchor="end"
                opacity={0.8}
              >
                {frame.time}
              </text>
            </g>
          )
        })}
      </svg>
      <p className="mt-2 text-center text-xs text-[var(--accent)]">
        Orange = hot path (optimization target)
      </p>
    </div>
  )
}

function CodeBlock({ code, language, variant }: { code: string; language: string; variant: 'problem' | 'solution' }) {
  return (
    <div className={`rounded-lg border ${
      variant === 'problem' 
        ? 'border-[var(--flame-5)]/20 bg-[var(--flame-5)]/5' 
        : 'border-green-500/20 bg-green-500/5'
    } p-3`}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`text-xs ${variant === 'problem' ? 'text-[var(--flame-5)]' : 'text-green-400'}`}>
          {variant === 'problem' ? '✗ Problem' : '✓ Solution'}
        </span>
        <span className="text-xs text-[var(--text-muted)]">{language}</span>
      </div>
      <pre className="overflow-x-auto text-xs leading-relaxed">
        <code className="font-mono text-[var(--text-muted)]">{code}</code>
      </pre>
    </div>
  )
}

export function MobilePatterns() {
  const [expandedId, setExpandedId] = useState<string | null>(patterns[0].id)

  return (
    <div className="space-y-4">
      {patterns.map((pattern) => {
        const isExpanded = expandedId === pattern.id
        
        return (
          <motion.div
            key={pattern.id}
            className="overflow-hidden rounded-lg border border-[var(--surface)] bg-[var(--surface)]"
            initial={false}
            animate={{ 
              borderColor: isExpanded ? 'var(--accent)' : 'var(--surface)' 
            }}
            transition={{ duration: 0.2 }}
          >
            {/* Header - always visible */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : pattern.id)}
              className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-[var(--bg)]"
            >
              <div>
                <h4 className="font-display text-display-sm text-[var(--text)]">
                  {pattern.title}
                </h4>
                <p className="mt-2 text-body-md text-[var(--text-muted)]">{pattern.description}</p>
              </div>
              <motion.span
                className="ml-4 text-2xl text-[var(--text-muted)]"
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                ↓
              </motion.span>
            </button>

            {/* Expandable content */}
            <motion.div
              initial={false}
              animate={{ 
                height: isExpanded ? 'auto' : 0,
                opacity: isExpanded ? 1 : 0
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="border-t border-[var(--bg)] p-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  {/* Code examples */}
                  <div className="space-y-3">
                    <CodeBlock 
                      code={pattern.problem.code} 
                      language={pattern.problem.language}
                      variant="problem"
                    />
                    <CodeBlock 
                      code={pattern.solution.code} 
                      language={pattern.solution.language}
                      variant="solution"
                    />
                  </div>

                  {/* Mini flame graph */}
                  <div>
                    <MiniFlameGraph data={pattern.flameData} />
                    <p className="mt-3 text-xs text-[var(--text-muted)]">
                      This is what the problem looks like in a CPU profile. 
                      The highlighted frames show where time is actually spent.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )
      })}
    </div>
  )
}
