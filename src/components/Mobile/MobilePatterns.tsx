import { useState } from 'react'

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
    description: 'Reading layout properties forces recalculation. In a loop, cost multiplies.',
    problem: {
      language: 'javascript',
      code: `// Each read forces layout recalculation
items.forEach(item => {
  const width = container.offsetWidth  // read
  item.style.width = width + 'px'      // write
})  // O(n²) layouts!`,
    },
    solution: {
      language: 'javascript',
      code: `// Batch reads, then writes
const width = container.offsetWidth  // one read
items.forEach(item => {
  item.style.width = width + 'px'     // writes only
})  // O(n) layouts`,
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
      code: `// Synchronous reads block main thread
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
  const padding = 3
  const svgWidth = 400
  const svgHeight = data.frames.length * (frameHeight + padding) + 8
  
  // Truncate text based on available pixel width (approx 6px per char at font-size 10)
  const truncateForWidth = (text: string, availableWidth: number) => {
    const charWidth = 6
    const maxChars = Math.floor((availableWidth - 50) / charWidth) // 50px reserved for time
    if (text.length <= maxChars) return text
    if (maxChars < 4) return ''
    return text.slice(0, maxChars - 2) + '…'
  }
  
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-[var(--text-muted)]">Profile view</span>
        <span className="font-mono text-[var(--text)]">{data.totalTime} total</span>
      </div>
      <div className="rounded-lg bg-[var(--bg)] p-3">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full" style={{ height: 'auto' }}>
          {data.frames.map((frame, i) => {
            const y = i * (frameHeight + padding) + 4
            const width = (frame.width / 100) * (svgWidth - 10)
            const isHot = frame.isHot
            const displayName = truncateForWidth(frame.name, width)
            
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
                {displayName && (
                  <text
                    x={10}
                    y={y + frameHeight / 2 + 4}
                    fontSize="11"
                    fontFamily="var(--font-mono)"
                    fill={isHot ? 'var(--bg)' : 'var(--text-muted)'}
                  >
                    {displayName}
                  </text>
                )}
                <text
                  x={width - 2}
                  y={y + frameHeight / 2 + 4}
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                  fill={isHot ? 'var(--bg)' : 'var(--text-muted)'}
                  textAnchor="end"
                >
                  {frame.time}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
        Orange = hot path (optimization target)
      </p>
    </div>
  )
}

export function MobilePatterns() {
  const [activePattern, setActivePattern] = useState(0)
  const [showSolution, setShowSolution] = useState(false)
  
  const pattern = patterns[activePattern]
  const code = showSolution ? pattern.solution : pattern.problem

  return (
    <div className="rounded-lg border border-[var(--surface)] bg-[var(--surface)] p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h4 className="text-lg text-[var(--text)]">{pattern.title}</h4>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{pattern.description}</p>
        </div>
      </div>

      {/* Pattern selector */}
      <div className="mb-6 flex gap-2">
        {patterns.map((p, i) => (
          <button
            key={p.id}
            onClick={() => {
              setActivePattern(i)
              setShowSolution(false)
            }}
            className={`btn ${activePattern === i ? 'btn-active' : ''}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Flame graph */}
      <div className="mb-6">
        <MiniFlameGraph data={pattern.flameData} />
      </div>

      {/* Problem/Solution toggle */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setShowSolution(false)}
          className={`btn ${!showSolution ? 'btn-active' : ''}`}
        >
          Problem
        </button>
        <button
          onClick={() => setShowSolution(true)}
          className={`btn ${showSolution ? 'btn-active' : ''}`}
          style={showSolution ? { 
            backgroundColor: 'var(--text)', 
            borderColor: 'var(--text)',
            color: 'var(--bg)'
          } : undefined}
        >
          Solution
        </button>
      </div>

      {/* Code block */}
      <div className="rounded-lg bg-[var(--bg)] p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className={showSolution ? 'text-green-400' : 'text-[var(--accent)]'}>
            {showSolution ? '✓ Solution' : '✗ Problem'}
          </span>
          <span className="text-[var(--text-muted)]">{code.language}</span>
        </div>
        <pre className="whitespace-pre-wrap text-sm leading-relaxed">
          <code className="font-mono text-[var(--text-muted)]">{code.code}</code>
        </pre>
      </div>

      {/* Insight callout */}
      <div className="mt-6 rounded-lg border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-4">
        <p className="text-sm text-[var(--text-muted)]">
          <span className="text-[var(--text)]">Key insight:</span> The profile shows exactly where time goes. 
          The solution moves expensive work off the main thread or batches operations to reduce overhead.
        </p>
      </div>
    </div>
  )
}
