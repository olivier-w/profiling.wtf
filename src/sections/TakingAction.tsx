import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, Slider, ProgressBar } from '../components/UI'

export default function TakingAction() {
  const [targetPercent, setTargetPercent] = useState(30)
  const [speedup, setSpeedup] = useState(5)

  // Amdahl's Law calculation
  const parallelizable = targetPercent / 100
  const sequential = 1 - parallelizable
  const theoreticalSpeedup = 1 / (sequential + parallelizable / speedup)
  const percentImprovement = ((1 - 1 / theoreticalSpeedup) * 100)

  return (
    <div className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="section-header">
          <span className="section-number">Section 09</span>
          <h2 className="section-title">Taking Action</h2>
          <p className="section-subtitle">
            Understanding flame graphs is only half the battle. Now let's talk about 
            what to DO with the insights—and how to prioritize.
          </p>
        </div>

        {/* Amdahl's Law Calculator */}
        <div className="demo-container">
          <div className="demo-header">
            <h3 className="demo-title">📐 Amdahl's Law Calculator</h3>
          </div>
          
          <div className="demo-content">
            <div className="amdahl-intro">
              <p>
                <strong>Amdahl's Law:</strong> The maximum speedup of a program is limited by 
                the portion that can be improved. A 10x speedup on 5% of your code only 
                gives you a 4.5% total improvement.
              </p>
            </div>

            <div className="calculator-layout">
              <div className="inputs-section">
                <Slider
                  min={1}
                  max={80}
                  value={targetPercent}
                  onChange={setTargetPercent}
                  label="Target function is X% of runtime"
                  formatValue={(v) => `${v}%`}
                />
                
                <Slider
                  min={1}
                  max={20}
                  value={speedup}
                  onChange={setSpeedup}
                  label="Potential speedup"
                  formatValue={(v) => `${v}x faster`}
                />
              </div>

              <div className="result-section">
                <div className="result-card">
                  <span className="result-label">Maximum Total Improvement</span>
                  <span className="result-value">{percentImprovement.toFixed(1)}%</span>
                  <span className="result-formula">
                    Speedup: {theoreticalSpeedup.toFixed(2)}x
                  </span>
                </div>

                <div className="visual-comparison">
                  <div className="comparison-item">
                    <span className="comparison-label">Before</span>
                    <ProgressBar value={100} color="error" showPercentage={false} />
                    <span className="comparison-time">100ms</span>
                  </div>
                  <div className="comparison-item">
                    <span className="comparison-label">After</span>
                    <ProgressBar 
                      value={(1 / theoreticalSpeedup) * 100} 
                      color="success" 
                      showPercentage={false}
                    />
                    <span className="comparison-time">
                      {(100 / theoreticalSpeedup).toFixed(0)}ms
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="amdahl-insight">
              {percentImprovement < 10 && (
                <p className="insight-warning">
                  ⚠️ Even with a {speedup}x improvement to this {targetPercent}% portion, 
                  total improvement is only {percentImprovement.toFixed(1)}%. 
                  Consider focusing on larger portions of runtime first.
                </p>
              )}
              {percentImprovement >= 10 && percentImprovement < 30 && (
                <p className="insight-okay">
                  ✓ A {percentImprovement.toFixed(1)}% improvement is meaningful. 
                  This optimization is worth considering.
                </p>
              )}
              {percentImprovement >= 30 && (
                <p className="insight-good">
                  🎯 {percentImprovement.toFixed(1)}% improvement is significant! 
                  This is a high-value optimization target.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Patterns to Look For */}
        <div className="patterns-section">
          <h3>🔍 Patterns to Look For in Flame Graphs</h3>
          <div className="patterns-grid">
            <Card>
              <div className="pattern-header">
                <span className="pattern-icon">📊</span>
                <h4>Flat Tops (High Self-Time)</h4>
              </div>
              <p>
                Functions at the top with wide frames are doing actual work. 
                These are your optimization targets.
              </p>
              <code className="pattern-example">parseJSON: 40% self-time</code>
            </Card>

            <Card>
              <div className="pattern-header">
                <span className="pattern-icon">🔄</span>
                <h4>Recursive Towers</h4>
              </div>
              <p>
                Deep, repeating patterns suggest recursion. Consider 
                memoization or iterative alternatives.
              </p>
              <code className="pattern-example">fib → fib → fib → fib...</code>
            </Card>

            <Card>
              <div className="pattern-header">
                <span className="pattern-icon">🌲</span>
                <h4>Repeated Identical Subtrees</h4>
              </div>
              <p>
                Same call patterns appearing multiple times indicate 
                redundant work. Cache or deduplicate.
              </p>
              <code className="pattern-example">loadConfig called 50 times</code>
            </Card>

            <Card>
              <div className="pattern-header">
                <span className="pattern-icon">📚</span>
                <h4>Wide Library Calls</h4>
              </div>
              <p>
                If library code dominates, check if you're using the 
                right API or passing optimal options.
              </p>
              <code className="pattern-example">JSON.parse: try streaming</code>
            </Card>
          </div>
        </div>

        {/* When NOT to Optimize */}
        <Card className="when-not-section">
          <h3>🛑 When NOT to Optimize</h3>
          <div className="when-not-grid">
            <div className="when-not-item">
              <span className="when-not-icon">✅</span>
              <h4>"Good Enough" is Valid</h4>
              <p>
                If response time is 50ms and users expect under 100ms, 
                you're done. Ship it.
              </p>
            </div>
            <div className="when-not-item">
              <span className="when-not-icon">💸</span>
              <h4>Optimization Has Cost</h4>
              <p>
                Optimized code is often harder to read and maintain. 
                Only pay this cost when needed.
              </p>
            </div>
            <div className="when-not-item">
              <span className="when-not-icon">🧪</span>
              <h4>Synthetic ≠ Real</h4>
              <p>
                Profile in realistic conditions. Don't optimize for 
                benchmarks that don't match production.
              </p>
            </div>
          </div>
        </Card>

        {/* The Performance Loop */}
        <div className="loop-section">
          <h3>🔁 The Performance Engineering Loop</h3>
          <div className="loop-steps">
            {[
              { num: 1, title: 'Profile', desc: 'Measure baseline performance' },
              { num: 2, title: 'Analyze', desc: 'Identify the biggest contributor' },
              { num: 3, title: 'Hypothesize', desc: 'What change might help?' },
              { num: 4, title: 'Change', desc: 'Implement the improvement' },
              { num: 5, title: 'Profile Again', desc: 'Measure the impact' },
              { num: 6, title: 'Repeat', desc: 'Continue until satisfied' },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                className="loop-step"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <span className="step-num">{step.num}</span>
                <div className="step-content">
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
                {i < 5 && <span className="step-arrow">→</span>}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Final Takeaway */}
        <motion.div
          className="final-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>🎓 You've Learned</h2>
          <div className="final-grid">
            <div className="final-item">
              <span className="check">✓</span>
              <span>How profilers capture data (sampling vs instrumentation)</span>
            </div>
            <div className="final-item">
              <span className="check">✓</span>
              <span>How flame graphs are built from raw samples</span>
            </div>
            <div className="final-item">
              <span className="check">✓</span>
              <span>How to read flame graphs (self-time vs total-time)</span>
            </div>
            <div className="final-item">
              <span className="check">✓</span>
              <span>Common mistakes and how to avoid them</span>
            </div>
            <div className="final-item">
              <span className="check">✓</span>
              <span>Flame graph variations (charts, icicle, differential)</span>
            </div>
            <div className="final-item">
              <span className="check">✓</span>
              <span>How to prioritize optimizations (Amdahl's Law)</span>
            </div>
          </div>

          <p className="final-message">
            Now go forth and profile! The next time you suspect a performance issue, 
            don't guess—measure. Your flame graph awaits. 🔥
          </p>
        </motion.div>
      </motion.div>

      <style>{`
        .amdahl-intro {
          margin-bottom: var(--space-6);
          padding: var(--space-4);
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
        }

        .calculator-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-8);
        }

        .inputs-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .result-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .result-card {
          background: linear-gradient(135deg, var(--color-accent-primary), var(--color-flame-hot));
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          text-align: center;
          color: white;
        }

        .result-label {
          display: block;
          font-size: var(--text-sm);
          opacity: 0.9;
          margin-bottom: var(--space-2);
        }

        .result-value {
          display: block;
          font-family: var(--font-mono);
          font-size: var(--text-5xl);
          font-weight: 700;
        }

        .result-formula {
          display: block;
          font-size: var(--text-sm);
          opacity: 0.8;
          margin-top: var(--space-2);
        }

        .visual-comparison {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .comparison-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .comparison-label {
          width: 50px;
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
        }

        .comparison-time {
          width: 60px;
          font-family: var(--font-mono);
          font-size: var(--text-sm);
          text-align: right;
        }

        .comparison-item > div {
          flex: 1;
        }

        .amdahl-insight {
          margin-top: var(--space-4);
          padding: var(--space-4);
          border-radius: var(--radius-md);
        }

        .insight-warning {
          background: var(--color-warning-subtle);
          color: var(--color-warning);
          padding: var(--space-3);
          border-radius: var(--radius-md);
        }

        .insight-okay {
          background: var(--color-bg-tertiary);
          color: var(--color-text-secondary);
          padding: var(--space-3);
          border-radius: var(--radius-md);
        }

        .insight-good {
          background: var(--color-success-subtle);
          color: var(--color-success);
          padding: var(--space-3);
          border-radius: var(--radius-md);
        }

        .patterns-section {
          margin-top: var(--space-12);
        }

        .patterns-section h3 {
          text-align: center;
          margin-bottom: var(--space-6);
        }

        .patterns-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-4);
        }

        .pattern-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
        }

        .pattern-icon {
          font-size: var(--text-xl);
        }

        .pattern-header h4 {
          margin: 0;
        }

        .pattern-example {
          display: block;
          margin-top: var(--space-3);
          font-size: var(--text-xs);
        }

        .when-not-section {
          margin-top: var(--space-12);
        }

        .when-not-section h3 {
          margin-bottom: var(--space-6);
        }

        .when-not-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-6);
        }

        .when-not-item {
          text-align: center;
        }

        .when-not-icon {
          font-size: var(--text-3xl);
          display: block;
          margin-bottom: var(--space-3);
        }

        .when-not-item h4 {
          margin-bottom: var(--space-2);
        }

        .when-not-item p {
          font-size: var(--text-sm);
        }

        .loop-section {
          margin-top: var(--space-12);
        }

        .loop-section h3 {
          text-align: center;
          margin-bottom: var(--space-6);
        }

        .loop-steps {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: var(--space-4);
        }

        .loop-step {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .step-num {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--color-accent-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .step-content h4 {
          font-size: var(--text-sm);
          margin: 0;
        }

        .step-content p {
          font-size: var(--text-xs);
          margin: 0;
          color: var(--color-text-tertiary);
        }

        .step-arrow {
          font-size: var(--text-xl);
          color: var(--color-text-tertiary);
        }

        .final-section {
          margin-top: var(--space-16);
          text-align: center;
          padding: var(--space-12);
          background: linear-gradient(135deg, rgba(88, 166, 255, 0.1), rgba(255, 107, 53, 0.1));
          border-radius: var(--radius-xl);
        }

        .final-section h2 {
          margin-bottom: var(--space-8);
        }

        .final-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-4);
          max-width: 700px;
          margin: 0 auto var(--space-8);
          text-align: left;
        }

        .final-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .check {
          color: var(--color-success);
          font-size: var(--text-xl);
        }

        .final-message {
          font-size: var(--text-xl);
          color: var(--color-text-primary);
          max-width: 500px;
          margin: 0 auto;
          line-height: 1.6;
        }

        @media (max-width: 1024px) {
          .calculator-layout,
          .patterns-grid {
            grid-template-columns: 1fr;
          }

          .when-not-grid {
            grid-template-columns: 1fr;
          }

          .final-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
