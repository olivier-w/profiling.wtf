import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button, Card } from '../components/UI'

interface Scenario {
  id: string
  title: string
  icon: string
  description: string
  objective: string
  code: string
  flameGraphData: { name: string; value: number; selfValue: number }[]
  hints: string[]
  answer: string
  explanation: string
}

const scenarios: Scenario[] = [
  {
    id: 'hot-path',
    title: 'Find the Hot Path',
    icon: '🔥',
    description: 'This code processes an array of items. One function has a hidden O(n²) complexity.',
    objective: 'Identify which function is causing the performance bottleneck.',
    code: `function processItems(items) {
  const results = [];
  for (const item of items) {
    const validated = validateItem(item);
    const enriched = enrichItem(validated);
    results.push(enriched);
  }
  return results;
}

function validateItem(item) {
  // Quick O(n) validation
  return item.data.every(x => x > 0);
}

function enrichItem(item) {
  // This looks innocent but...
  return {
    ...item,
    duplicates: findDuplicates(item.data)
  };
}

function findDuplicates(arr) {
  // O(n²) nested loop!
  const dupes = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) dupes.push(arr[i]);
    }
  }
  return dupes;
}`,
    flameGraphData: [
      { name: 'processItems', value: 100, selfValue: 5 },
      { name: 'validateItem', value: 10, selfValue: 10 },
      { name: 'enrichItem', value: 85, selfValue: 2 },
      { name: 'findDuplicates', value: 83, selfValue: 83 },
    ],
    hints: [
      'Look at the flame graph widths. Which function takes the most time?',
      'Check the self-time. A wide frame might just be calling something slow.',
      'findDuplicates has the highest self-time—it\'s doing the actual work.',
    ],
    answer: 'findDuplicates',
    explanation: 'findDuplicates is 83% of total time with O(n²) complexity. enrichItem looks expensive but it just calls findDuplicates. Use a Set or Map for O(n) duplicate detection.',
  },
  {
    id: 'thousand-cuts',
    title: 'Death by a Thousand Cuts',
    icon: '⚔️',
    description: 'Two implementations of the same feature. One is slower despite doing the "same" thing.',
    objective: 'Understand why many small calls can be worse than one larger call.',
    code: `// Version A: Many small calls
function processA(items) {
  return items.map(item => {
    log('Processing item');
    const result = transform(item);
    log('Done');
    return result;
  });
}

// Version B: Batched
function processB(items) {
  logBatch('Processing ' + items.length + ' items');
  const results = transformBatch(items);
  logBatch('Done');
  return results;
}`,
    flameGraphData: [
      { name: 'processA', value: 60, selfValue: 5 },
      { name: 'log (×1000)', value: 40, selfValue: 40 },
      { name: 'transform (×1000)', value: 15, selfValue: 15 },
      { name: 'processB', value: 25, selfValue: 3 },
      { name: 'logBatch (×2)', value: 2, selfValue: 2 },
      { name: 'transformBatch', value: 20, selfValue: 20 },
    ],
    hints: [
      'Compare the total time of processA vs processB.',
      'Look at the log calls. 1000 small logs vs 2 batch logs.',
      'Function call overhead matters at scale!',
    ],
    answer: 'processA',
    explanation: 'processA is slower because 1000 small log() calls add up. Each function call has overhead (stack frame, argument passing). Batching reduces this overhead dramatically.',
  },
  {
    id: 'recursive-trap',
    title: 'The Recursive Trap',
    icon: '🔄',
    description: 'Recursive fibonacci vs iterative. The flame graphs look very different.',
    objective: 'Learn that stack depth doesn\'t indicate slowness—repeated work does.',
    code: `// Recursive (exponential time!)
function fibRecursive(n) {
  if (n <= 1) return n;
  return fibRecursive(n - 1) + fibRecursive(n - 2);
}

// Iterative (linear time)
function fibIterative(n) {
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) {
    [a, b] = [b, a + b];
  }
  return a;
}`,
    flameGraphData: [
      { name: 'fibRecursive', value: 95, selfValue: 5 },
      { name: 'fibRecursive (recursive)', value: 90, selfValue: 90 },
      { name: 'fibIterative', value: 5, selfValue: 5 },
    ],
    hints: [
      'The recursive version shows a deep call stack.',
      'But depth isn\'t the problem—repeated calculations are.',
      'fib(n) calls fib(n-1) AND fib(n-2), causing exponential calls.',
    ],
    answer: 'fibRecursive',
    explanation: 'Recursive fibonacci is O(2^n) because it recalculates the same values. The flame graph shows repeated work, not just depth. Memoization or iteration fixes this.',
  },
  {
    id: 'before-after',
    title: 'Before & After',
    icon: '📊',
    description: 'We optimized the code. Did it actually get faster?',
    objective: 'Use differential flame graphs to validate an optimization.',
    code: `// Before: N+1 query problem
async function getUsersWithPosts() {
  const users = await db.query('SELECT * FROM users');
  for (const user of users) {
    user.posts = await db.query(
      'SELECT * FROM posts WHERE user_id = ?', 
      [user.id]
    );
  }
  return users;
}

// After: Single JOIN query
async function getUsersWithPostsOptimized() {
  return db.query(\`
    SELECT users.*, posts.* 
    FROM users 
    LEFT JOIN posts ON users.id = posts.user_id
  \`);
}`,
    flameGraphData: [
      { name: 'Before: getUsersWithPosts', value: 100, selfValue: 5 },
      { name: 'db.query (×101)', value: 95, selfValue: 95 },
      { name: 'After: getUsersWithPostsOptimized', value: 15, selfValue: 2 },
      { name: 'db.query (×1)', value: 13, selfValue: 13 },
    ],
    hints: [
      'Count the database queries in each version.',
      'N+1 problem: 1 query for users + N queries for posts.',
      'The JOIN reduces 101 queries to just 1.',
    ],
    answer: 'After',
    explanation: 'The N+1 query problem caused 101 database calls. The JOIN version does it in 1 call. Result: ~85% reduction in time. This is a classic database optimization.',
  },
]

export default function GuidedPractice() {
  const [activeScenario, setActiveScenario] = useState<string | null>(null)
  const [showHints, setShowHints] = useState(false)
  const [hintIndex, setHintIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')

  const scenario = scenarios.find(s => s.id === activeScenario)

  const resetScenario = () => {
    setShowHints(false)
    setHintIndex(0)
    setShowAnswer(false)
    setUserAnswer('')
  }

  const selectScenario = (id: string) => {
    setActiveScenario(id)
    resetScenario()
  }

  const renderMiniFlameGraph = (data: { name: string; value: number; selfValue: number }[]) => {
    const maxValue = Math.max(...data.map(d => d.value))
    const colors = ['#ff6b35', '#ffa94d', '#ffd43b', '#4dabf7']

    return (
      <div className="mini-flamegraph">
        {data.map((frame, i) => (
          <div
            key={frame.name}
            className="mini-frame"
            style={{
              width: `${(frame.value / maxValue) * 100}%`,
              backgroundColor: colors[i % colors.length],
            }}
          >
            <span className="frame-name">{frame.name}</span>
            <span className="frame-value">{frame.value}%</span>
          </div>
        ))}
      </div>
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
          <span className="section-number">Section 07</span>
          <h2 className="section-title">Guided Practice</h2>
          <p className="section-subtitle">
            Apply what you've learned with these real-world scenarios. 
            Each one teaches a specific performance pattern.
          </p>
        </div>

        {/* Scenario Selection */}
        {!activeScenario && (
          <div className="scenario-grid">
            {scenarios.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card 
                  className="scenario-card"
                  onClick={() => selectScenario(s.id)}
                >
                  <span className="scenario-icon">{s.icon}</span>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                  <Button variant="secondary" size="sm">
                    Start Scenario →
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Active Scenario */}
        {activeScenario && scenario && (
          <motion.div
            className="active-scenario"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="scenario-header">
              <Button variant="ghost" onClick={() => setActiveScenario(null)}>
                ← Back to Scenarios
              </Button>
              <div className="scenario-title">
                <span className="scenario-icon">{scenario.icon}</span>
                <h3>{scenario.title}</h3>
              </div>
            </div>

            <div className="scenario-layout">
              {/* Code Panel */}
              <div className="code-panel">
                <div className="panel-label">📄 Code</div>
                <pre className="scenario-code">{scenario.code}</pre>
              </div>

              {/* Flame Graph Panel */}
              <div className="flamegraph-panel">
                <div className="panel-label">🔥 Flame Graph (simplified)</div>
                {renderMiniFlameGraph(scenario.flameGraphData)}
              </div>
            </div>

            {/* Objective */}
            <Card className="objective-card">
              <h4>🎯 Objective</h4>
              <p>{scenario.objective}</p>
            </Card>

            {/* Hints */}
            {!showAnswer && (
              <div className="hints-section">
                {!showHints ? (
                  <Button variant="ghost" onClick={() => setShowHints(true)}>
                    Need a hint?
                  </Button>
                ) : (
                  <div className="hints-list">
                    {scenario.hints.slice(0, hintIndex + 1).map((hint, i) => (
                      <motion.div
                        key={i}
                        className="hint"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <span className="hint-number">Hint {i + 1}:</span> {hint}
                      </motion.div>
                    ))}
                    {hintIndex < scenario.hints.length - 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setHintIndex(h => h + 1)}
                      >
                        Another hint
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Answer Input */}
            {!showAnswer && (
              <div className="answer-section">
                <p>Which function/approach is the bottleneck or better solution?</p>
                <div className="answer-input">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer..."
                    onKeyDown={(e) => e.key === 'Enter' && setShowAnswer(true)}
                  />
                  <Button onClick={() => setShowAnswer(true)}>
                    Check Answer
                  </Button>
                </div>
              </div>
            )}

            {/* Result */}
            {showAnswer && (
              <motion.div
                className={`result-card ${userAnswer.toLowerCase().includes(scenario.answer.toLowerCase()) ? 'correct' : 'incorrect'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h4>
                  {userAnswer.toLowerCase().includes(scenario.answer.toLowerCase()) 
                    ? '✅ Correct!' 
                    : '❌ Not quite!'
                  }
                </h4>
                <p><strong>Answer:</strong> {scenario.answer}</p>
                <p>{scenario.explanation}</p>
                <div className="result-actions">
                  <Button variant="secondary" onClick={resetScenario}>
                    Try Again
                  </Button>
                  <Button onClick={() => setActiveScenario(null)}>
                    Next Scenario →
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>

      <style>{`
        .scenario-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-6);
        }

        .scenario-card {
          cursor: pointer;
          text-align: center;
          transition: all var(--transition-base);
        }

        .scenario-card:hover {
          transform: translateY(-4px);
        }

        .scenario-icon {
          font-size: var(--text-4xl);
          display: block;
          margin-bottom: var(--space-3);
        }

        .scenario-card h3 {
          margin-bottom: var(--space-2);
        }

        .scenario-card p {
          font-size: var(--text-sm);
          margin-bottom: var(--space-4);
        }

        .active-scenario {
          max-width: 1000px;
          margin: 0 auto;
        }

        .scenario-header {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }

        .scenario-title {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .scenario-title h3 {
          margin: 0;
        }

        .scenario-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-6);
          margin-bottom: var(--space-6);
        }

        .panel-label {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-text-secondary);
          margin-bottom: var(--space-3);
        }

        .scenario-code {
          font-size: var(--text-xs);
          line-height: 1.6;
          max-height: 400px;
          overflow: auto;
        }

        .mini-flamegraph {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .mini-frame {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          color: #000;
          font-weight: 500;
        }

        .frame-value {
          font-family: var(--font-mono);
          font-weight: 600;
        }

        .objective-card {
          margin-bottom: var(--space-6);
        }

        .objective-card h4 {
          margin-bottom: var(--space-2);
          color: var(--color-accent-primary);
        }

        .hints-section {
          margin-bottom: var(--space-6);
        }

        .hints-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .hint {
          background: var(--color-bg-tertiary);
          padding: var(--space-3);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
        }

        .hint-number {
          color: var(--color-accent-primary);
          font-weight: 600;
        }

        .answer-section {
          text-align: center;
        }

        .answer-input {
          display: flex;
          gap: var(--space-3);
          justify-content: center;
          margin-top: var(--space-4);
        }

        .answer-input input {
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-md);
          padding: var(--space-3) var(--space-4);
          font-size: var(--text-base);
          color: var(--color-text-primary);
          width: 300px;
        }

        .answer-input input:focus {
          outline: none;
          border-color: var(--color-accent-primary);
        }

        .result-card {
          padding: var(--space-6);
          border-radius: var(--radius-lg);
          text-align: center;
        }

        .result-card.correct {
          background: var(--color-success-subtle);
          border: 1px solid var(--color-success);
        }

        .result-card.incorrect {
          background: var(--color-error-subtle);
          border: 1px solid var(--color-error);
        }

        .result-card h4 {
          font-size: var(--text-xl);
          margin-bottom: var(--space-4);
        }

        .result-card p {
          margin-bottom: var(--space-4);
        }

        .result-actions {
          display: flex;
          gap: var(--space-4);
          justify-content: center;
          margin-top: var(--space-6);
        }

        @media (max-width: 768px) {
          .scenario-grid,
          .scenario-layout {
            grid-template-columns: 1fr;
          }

          .answer-input {
            flex-direction: column;
            align-items: center;
          }

          .answer-input input {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
