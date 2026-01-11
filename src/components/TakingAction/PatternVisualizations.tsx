// Mini flame graph visualizations for common patterns to look for

interface PatternProps {
  title: string
  description: string
  children: React.ReactNode
}

function PatternCard({ title, description, children }: PatternProps) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[var(--text)]">{title}</p>
        <p className="text-sm text-[var(--text-muted)]">{description}</p>
      </div>
      <div className="rounded bg-[var(--surface)] p-3">
        {children}
      </div>
    </div>
  )
}

function FlatTopPattern() {
  // A flame graph where the top frame is wide (high self-time)
  return (
    <svg width="200" height="70" className="block">
      {/* main - wide but just dispatcher */}
      <rect x="0" y="50" width="200" height="18" fill="var(--flame-4)" rx="2" />
      <text x="4" y="63" fill="var(--bg)" fontSize="9" fontFamily="var(--font-mono)">main</text>
      
      {/* process - still dispatcher */}
      <rect x="0" y="30" width="180" height="18" fill="var(--flame-3)" rx="2" />
      <text x="4" y="43" fill="var(--bg)" fontSize="9" fontFamily="var(--font-mono)">process</text>
      
      {/* compute - FLAT TOP with high self-time */}
      <rect x="0" y="10" width="160" height="18" fill="var(--flame-2)" rx="2" stroke="var(--accent)" strokeWidth="2" />
      <text x="4" y="23" fill="var(--bg)" fontSize="9" fontFamily="var(--font-mono)">compute ← start here</text>
    </svg>
  )
}

function RecursiveTowerPattern() {
  // Deep narrow stack showing recursion
  const frames = ['fib(5)', 'fib(4)', 'fib(3)', 'fib(2)', 'fib(1)']
  const frameHeight = 12
  const width = 60
  
  return (
    <svg width="200" height="75" className="block">
      {frames.map((name, i) => (
        <g key={i}>
          <rect 
            x={70} 
            y={60 - i * (frameHeight + 1)} 
            width={width} 
            height={frameHeight} 
            fill={`var(--flame-${Math.min(i + 1, 4)})`} 
            rx="2" 
          />
          <text 
            x={74} 
            y={60 - i * (frameHeight + 1) + 9} 
            fill="var(--bg)" 
            fontSize="8" 
            fontFamily="var(--font-mono)"
          >
            {name}
          </text>
        </g>
      ))}
      {/* Arrow indicating depth */}
      <line x1="145" y1="60" x2="145" y2="10" stroke="var(--text-muted)" strokeWidth="1" markerEnd="url(#arrowhead)" />
      <text x="150" y="40" fill="var(--text-muted)" fontSize="8">deep</text>
      
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill="var(--text-muted)" />
        </marker>
      </defs>
    </svg>
  )
}

function RepeatedSubtreePattern() {
  // Same subtree appearing multiple times
  return (
    <svg width="200" height="70" className="block">
      {/* main */}
      <rect x="0" y="50" width="200" height="18" fill="var(--flame-4)" rx="2" />
      <text x="4" y="63" fill="var(--bg)" fontSize="9" fontFamily="var(--font-mono)">main</text>
      
      {/* Two callers */}
      <rect x="0" y="30" width="90" height="18" fill="var(--flame-3)" rx="2" />
      <text x="4" y="43" fill="var(--bg)" fontSize="9" fontFamily="var(--font-mono)">initA</text>
      
      <rect x="100" y="30" width="90" height="18" fill="var(--flame-3)" rx="2" />
      <text x="104" y="43" fill="var(--bg)" fontSize="9" fontFamily="var(--font-mono)">initB</text>
      
      {/* Same work done twice - highlighted */}
      <rect x="10" y="10" width="70" height="18" fill="var(--flame-2)" rx="2" stroke="var(--accent)" strokeWidth="1" />
      <text x="14" y="23" fill="var(--bg)" fontSize="9" fontFamily="var(--font-mono)">loadConfig</text>
      
      <rect x="110" y="10" width="70" height="18" fill="var(--flame-2)" rx="2" stroke="var(--accent)" strokeWidth="1" />
      <text x="114" y="23" fill="var(--bg)" fontSize="9" fontFamily="var(--font-mono)">loadConfig</text>
    </svg>
  )
}

function WideLibraryPattern() {
  // Wide library call that dominates
  return (
    <svg width="200" height="70" className="block">
      {/* main */}
      <rect x="0" y="50" width="200" height="18" fill="var(--flame-4)" rx="2" />
      <text x="4" y="63" fill="var(--bg)" fontSize="9" fontFamily="var(--font-mono)">handleRequest</text>
      
      {/* User code - small */}
      <rect x="0" y="30" width="30" height="18" fill="var(--flame-3)" rx="2" />
      <text x="4" y="43" fill="var(--bg)" fontSize="7" fontFamily="var(--font-mono)">parse</text>
      
      {/* Library call - wide and highlighted */}
      <rect x="35" y="30" width="160" height="18" fill="#3b82f6" rx="2" stroke="var(--accent)" strokeWidth="1" />
      <text x="39" y="43" fill="#fff" fontSize="9" fontFamily="var(--font-mono)">ORM.fetchAll ← wrong API?</text>
    </svg>
  )
}

export function PatternVisualizations() {
  return (
    <div className="grid gap-8 sm:grid-cols-2">
      <PatternCard
        title="Flat tops"
        description="High self-time = actual work. Start here."
      >
        <FlatTopPattern />
      </PatternCard>
      
      <PatternCard
        title="Recursive towers"
        description="Deep narrow stacks. Consider memoization."
      >
        <RecursiveTowerPattern />
      </PatternCard>
      
      <PatternCard
        title="Repeated subtrees"
        description="Same work done twice. Cache or dedupe."
      >
        <RepeatedSubtreePattern />
      </PatternCard>
      
      <PatternCard
        title="Wide library calls"
        description="Wrong API? Missing batching/streaming?"
      >
        <WideLibraryPattern />
      </PatternCard>
    </div>
  )
}
