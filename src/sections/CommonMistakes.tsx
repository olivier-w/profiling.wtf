import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Card } from '../components/UI'

interface QuizQuestion {
  id: number
  flamegraph: string // ASCII representation for simplicity
  analysis: string
  isCorrect: boolean
  mistakeType: string
  explanation: string
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    flamegraph: `
    ┌─────────────────────────────────────────┐
    │              processData                 │
    ├───────────────────┬─────────────────────┤
    │     parseJSON     │      validate       │
    └───────────────────┴─────────────────────┘
    `,
    analysis: '"processData takes the most time because it\'s the widest frame at the bottom."',
    isCorrect: false,
    mistakeType: '"Wide frame at bottom = slow"',
    explanation: 'processData is wide because it CALLS parseJSON and validate. Its width includes all child time. Look at the TOP edge to find actual work—parseJSON and validate are doing the real work.',
  },
  {
    id: 2,
    flamegraph: `
    ┌─────────────────────────────────────────┐
    │                main                      │
    ├───────────────────┬─────────────────────┤
    │   handleRequest   │     processData     │
    └───────────────────┴─────────────────────┘
    `,
    analysis: '"handleRequest executes before processData because it appears on the left."',
    isCorrect: false,
    mistakeType: '"X-axis is time"',
    explanation: 'The x-axis is alphabetically sorted, NOT time-ordered! "handleRequest" comes before "processData" alphabetically. To see execution order, use a flame CHART instead.',
  },
  {
    id: 3,
    flamegraph: `
    ┌─────────────────────────────────────────┐
    │                main                      │
    ├───────────────────┬─────────────────────┤
    │ 🔴 parseJSON     │ 🟡 validate          │
    └───────────────────┴─────────────────────┘
    `,
    analysis: '"parseJSON (red) is slower than validate (yellow) based on the colors."',
    isCorrect: false,
    mistakeType: '"Colors indicate performance"',
    explanation: 'In classic flame graphs, colors are RANDOM—they\'re just for visual differentiation. Some tools use heat colors semantically, but you must check. Here, width tells the story: parseJSON is wider, so it took more time.',
  },
  {
    id: 4,
    flamegraph: `
    ┌─────────────────────────────────────────┐
    │              fetchData                   │
    ├───────────────────────────┬─────────────┤
    │        queryDB            │   cache     │
    └───────────────────────────┴─────────────┘
    `,
    analysis: '"queryDB takes about 75% of the time, and cache takes about 25%. I should focus on optimizing queryDB."',
    isCorrect: true,
    mistakeType: 'None',
    explanation: 'Correct! Width directly correlates with time spent. queryDB is roughly 3x wider than cache, making it the clear optimization target. Always focus on the widest frames first.',
  },
  {
    id: 5,
    flamegraph: `
    ┌─────────────────────────────────────────┐
    │         processItems                     │
    ├─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┤
    │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │
    └─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘
    (many narrow frames: transform, transform, transform...)
    `,
    analysis: '"Each transform call is narrow, so each one is fast. No optimization needed."',
    isCorrect: false,
    mistakeType: '"Narrow frame = fast"',
    explanation: 'Many narrow frames can add up! This shows 20+ transform calls—the TOTAL time might be significant. Look at the parent frame (processItems) width. Also, sampling profilers might miss some short calls entirely.',
  },
  {
    id: 6,
    flamegraph: `
    ┌─────────────────────────────────────────┐
    │                 main                     │
    ├─────────────────────────────────────────┤
    │              handleRequest               │
    ├─────────────────────────────────────────┤
    │                fetchAPI                  │
    └─────────────────────────────────────────┘
    `,
    analysis: '"fetchAPI is a flat, wide frame with no children. This is where all the time is spent, so I should optimize fetchAPI."',
    isCorrect: true,
    mistakeType: 'None',
    explanation: 'Correct! A wide frame with high self-time (no children above it) indicates actual work. This is exactly what you want to find—the hot path doing real computation.',
  },
]

export default function CommonMistakes() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [quizComplete, setQuizComplete] = useState(false)

  const question = quizQuestions[currentQuestion]

  const handleAnswer = (answer: boolean) => {
    setSelectedAnswer(answer)
    setShowExplanation(true)
    
    if (answer === question.isCorrect) {
      setScore(s => ({ ...s, correct: s.correct + 1, total: s.total + 1 }))
    } else {
      setScore(s => ({ ...s, total: s.total + 1 }))
    }
  }

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(c => c + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      setQuizComplete(true)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setScore({ correct: 0, total: 0 })
    setQuizComplete(false)
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
          <span className="section-number">Section 05</span>
          <h2 className="section-title">Common Mistakes</h2>
          <p className="section-subtitle">
            Even experienced developers misread flame graphs. Let's identify these 
            mistakes before they become bad habits.
          </p>
        </div>

        {/* Mistakes Overview */}
        <div className="mistakes-grid">
          {[
            { icon: '❌', title: '"X-axis is time"', fix: 'X-axis is alphabetical—use flame charts for time' },
            { icon: '❌', title: '"Wide bottom = slow"', fix: 'Check self-time; it might just call slow things' },
            { icon: '❌', title: '"Colors mean performance"', fix: 'Classic colors are random; check your tool' },
            { icon: '❌', title: '"Narrow = fast"', fix: 'Many narrow frames add up; short calls may be missed' },
            { icon: '❌', title: '"Optimize the widest"', fix: 'Check self-time first; wrappers have high total, low self' },
          ].map((mistake, i) => (
            <motion.div
              key={i}
              className="mistake-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="mistake-icon">{mistake.icon}</span>
              <h4>{mistake.title}</h4>
              <p className="mistake-fix">✓ {mistake.fix}</p>
            </motion.div>
          ))}
        </div>

        {/* Quiz */}
        <div className="demo-container quiz-container">
          <div className="demo-header">
            <h3 className="demo-title">🧪 Spot the Mistake Quiz</h3>
            <div className="quiz-progress">
              Question {currentQuestion + 1} of {quizQuestions.length}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!quizComplete ? (
              <motion.div
                key={currentQuestion}
                className="demo-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Flame Graph Visualization */}
                <div className="quiz-flamegraph">
                  <pre>{question.flamegraph}</pre>
                </div>

                {/* Analysis */}
                <div className="quiz-analysis">
                  <h4>Analysis:</h4>
                  <blockquote>{question.analysis}</blockquote>
                </div>

                {/* Answer Buttons */}
                {!showExplanation && (
                  <div className="quiz-buttons">
                    <Button 
                      variant="success" 
                      onClick={() => handleAnswer(true)}
                    >
                      ✓ Correct Analysis
                    </Button>
                    <Button 
                      variant="error" 
                      onClick={() => handleAnswer(false)}
                    >
                      ✗ Contains a Mistake
                    </Button>
                  </div>
                )}

                {/* Explanation */}
                {showExplanation && (
                  <motion.div
                    className={`quiz-result ${selectedAnswer === question.isCorrect ? 'correct' : 'incorrect'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="result-header">
                      {selectedAnswer === question.isCorrect ? (
                        <span className="result-icon">✅ Correct!</span>
                      ) : (
                        <span className="result-icon">❌ Not quite!</span>
                      )}
                      {question.mistakeType !== 'None' && (
                        <span className="mistake-badge">{question.mistakeType}</span>
                      )}
                    </div>
                    <p className="result-explanation">{question.explanation}</p>
                    <Button onClick={nextQuestion}>
                      {currentQuestion < quizQuestions.length - 1 ? 'Next Question →' : 'See Results'}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                className="quiz-complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="score-display">
                  <span className="score-value">{score.correct}</span>
                  <span className="score-divider">/</span>
                  <span className="score-total">{score.total}</span>
                </div>
                <h3>
                  {score.correct === score.total 
                    ? '🎉 Perfect Score!' 
                    : score.correct >= score.total * 0.7 
                      ? '👍 Nice work!' 
                      : '📚 Keep practicing!'}
                </h3>
                <p>
                  {score.correct === score.total 
                    ? 'You\'ve mastered flame graph analysis!' 
                    : 'Review the mistakes above and try again.'}
                </p>
                <Button onClick={resetQuiz}>Try Again</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Key Takeaway */}
        <Card className="takeaway-card">
          <h3>🎯 The Golden Rule</h3>
          <p>
            When analyzing a flame graph, always ask: <strong>"Where is the self-time?"</strong>
          </p>
          <p>
            Total time (width) shows the call hierarchy. Self-time (flat tops) shows 
            where work actually happens. Optimize the flat tops, not the callers.
          </p>
        </Card>
      </motion.div>

      <style>{`
        .mistakes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-4);
          margin-bottom: var(--space-12);
        }

        .mistake-card {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          text-align: center;
        }

        .mistake-icon {
          font-size: var(--text-2xl);
        }

        .mistake-card h4 {
          font-size: var(--text-sm);
          margin: var(--space-2) 0;
          color: var(--color-error);
        }

        .mistake-fix {
          font-size: var(--text-xs);
          color: var(--color-success);
        }

        .quiz-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .quiz-progress {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          color: var(--color-text-tertiary);
        }

        .quiz-flamegraph {
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          margin-bottom: var(--space-6);
          overflow-x: auto;
        }

        .quiz-flamegraph pre {
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          color: var(--color-flame-warm);
          margin: 0;
          white-space: pre;
        }

        .quiz-analysis {
          margin-bottom: var(--space-6);
        }

        .quiz-analysis h4 {
          font-size: var(--text-sm);
          color: var(--color-text-tertiary);
          margin-bottom: var(--space-2);
        }

        .quiz-analysis blockquote {
          font-size: var(--text-lg);
          font-style: italic;
          color: var(--color-text-primary);
          border-left: 3px solid var(--color-accent-primary);
          padding-left: var(--space-4);
          margin: 0;
        }

        .quiz-buttons {
          display: flex;
          gap: var(--space-4);
          justify-content: center;
        }

        .quiz-result {
          padding: var(--space-6);
          border-radius: var(--radius-lg);
          text-align: center;
        }

        .quiz-result.correct {
          background: var(--color-success-subtle);
          border: 1px solid var(--color-success);
        }

        .quiz-result.incorrect {
          background: var(--color-error-subtle);
          border: 1px solid var(--color-error);
        }

        .result-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
        }

        .result-icon {
          font-size: var(--text-xl);
          font-weight: 600;
        }

        .mistake-badge {
          background: var(--color-error);
          color: white;
          font-size: var(--text-xs);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm);
        }

        .result-explanation {
          max-width: 500px;
          margin: 0 auto var(--space-4);
          line-height: 1.6;
        }

        .quiz-complete {
          text-align: center;
          padding: var(--space-8);
        }

        .score-display {
          font-family: var(--font-mono);
          margin-bottom: var(--space-4);
        }

        .score-value {
          font-size: var(--text-6xl);
          font-weight: 700;
          color: var(--color-success);
        }

        .score-divider {
          font-size: var(--text-4xl);
          color: var(--color-text-tertiary);
          margin: 0 var(--space-2);
        }

        .score-total {
          font-size: var(--text-4xl);
          color: var(--color-text-secondary);
        }

        .quiz-complete h3 {
          margin-bottom: var(--space-2);
        }

        .quiz-complete p {
          margin-bottom: var(--space-6);
        }

        .takeaway-card {
          max-width: 700px;
          margin: var(--space-12) auto 0;
          text-align: center;
        }

        .takeaway-card h3 {
          margin-bottom: var(--space-4);
        }

        .takeaway-card p {
          margin-bottom: var(--space-4);
        }
      `}</style>
    </div>
  )
}
