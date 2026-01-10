import { motion } from 'framer-motion'
import { Card } from '../components/UI'

export default function WhyProfile() {
  return (
    <div className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Hero Section */}
        <div className="hero">
          <div className="hero-badge">
            <span className="hero-badge-icon">🎯</span>
            <span>The Performance Problem</span>
          </div>
          
          <h1 className="hero-title">
            Developers guess where performance
            <br />
            problems are.{' '}
            <span className="hero-highlight">They're wrong 90% of the time.</span>
          </h1>
          
          <p className="hero-subtitle">
            Code profiling replaces guesswork with measurement. It's the scientific method 
            for performance—and it starts with understanding flame graphs.
          </p>
        </div>

        {/* The Cost of Guessing */}
        <div className="content-section">
          <div className="grid grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="stat-card stat-card-bad">
                <div className="stat-icon">❌</div>
                <h3 className="stat-title">The Guessing Approach</h3>
                <ul className="stat-list">
                  <li>"I think this function is slow..."</li>
                  <li>"Let me add some console.log timers..."</li>
                  <li>"Maybe if I optimize this loop..."</li>
                  <li>Hours spent on 3% of runtime</li>
                </ul>
                <div className="stat-result stat-result-bad">
                  <span className="stat-result-label">Result:</span>
                  <span className="stat-result-value">Wasted effort, marginal gains</span>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Card className="stat-card stat-card-good">
                <div className="stat-icon">✅</div>
                <h3 className="stat-title">The Profiling Approach</h3>
                <ul className="stat-list">
                  <li>Run profiler, capture real data</li>
                  <li>See exactly where time is spent</li>
                  <li>Focus on the 40% hot path</li>
                  <li>Make targeted, effective changes</li>
                </ul>
                <div className="stat-result stat-result-good">
                  <span className="stat-result-label">Result:</span>
                  <span className="stat-result-value">10x speedup in hours, not days</span>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Real World Disaster Story */}
        <motion.div
          className="story-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Card className="story-card">
            <div className="story-header">
              <span className="story-badge">Real Story</span>
              <h3 className="story-title">Knight Capital: $440M Lost in 45 Minutes</h3>
            </div>
            <div className="story-content">
              <p>
                On August 1, 2012, Knight Capital deployed code that contained an old, 
                unused function. A configuration error reactivated it. Without proper 
                profiling and monitoring, no one noticed the runaway trades until 
                <strong> $440 million</strong> evaporated.
              </p>
              <p className="story-lesson">
                <strong>The lesson:</strong> Understanding your code's runtime behavior 
                isn't optional—it's existential. Profiling is how you see what's actually 
                happening.
              </p>
            </div>
            <div className="story-stats">
              <div className="story-stat">
                <span className="story-stat-value">45</span>
                <span className="story-stat-label">minutes</span>
              </div>
              <div className="story-stat">
                <span className="story-stat-value">$440M</span>
                <span className="story-stat-label">lost</span>
              </div>
              <div className="story-stat">
                <span className="story-stat-value">1</span>
                <span className="story-stat-label">config error</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* What You'll Learn */}
        <motion.div
          className="learn-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="learn-title">What You'll Learn</h2>
          <p className="learn-subtitle">
            By the end of this guide, you won't just know how to <em>read</em> flame graphs—
            you'll understand how they're <em>built</em> from raw profiler data.
          </p>
          
          <div className="learn-grid">
            {[
              { icon: '⏱️', title: 'How Profilers Work', desc: 'Sampling, instrumentation, and what the data really means' },
              { icon: '🔥', title: 'Flame Graph Construction', desc: 'Build one from scratch to truly understand the visualization' },
              { icon: '🔍', title: 'Reading & Analysis', desc: 'Self-time vs total-time, and avoiding common mistakes' },
              { icon: '🚀', title: 'Taking Action', desc: 'Prioritize optimizations with Amdahl\'s Law' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                className="learn-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <span className="learn-icon">{item.icon}</span>
                <h4 className="learn-item-title">{item.title}</h4>
                <p className="learn-item-desc">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="cta-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
        >
          <p className="cta-text">
            Ready to stop guessing and start measuring?
          </p>
          <div className="cta-arrow">↓</div>
          <p className="cta-next">Let's start with how profilers actually capture data.</p>
        </motion.div>
      </motion.div>

      <style>{`
        .hero {
          text-align: center;
          margin-bottom: var(--space-16);
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          background: var(--color-bg-tertiary);
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-full);
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
          margin-bottom: var(--space-6);
        }

        .hero-badge-icon {
          font-size: var(--text-base);
        }

        .hero-title {
          font-size: var(--text-5xl);
          line-height: 1.1;
          margin-bottom: var(--space-6);
        }

        .hero-highlight {
          background: linear-gradient(135deg, var(--color-flame-warm), var(--color-flame-hot));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: var(--text-xl);
          color: var(--color-text-secondary);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .content-section {
          margin-bottom: var(--space-16);
        }

        .stat-card {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .stat-icon {
          font-size: var(--text-3xl);
          margin-bottom: var(--space-4);
        }

        .stat-title {
          font-size: var(--text-xl);
          margin-bottom: var(--space-4);
        }

        .stat-list {
          list-style: none;
          margin-bottom: var(--space-6);
          flex: 1;
        }

        .stat-list li {
          padding: var(--space-2) 0;
          color: var(--color-text-secondary);
          border-bottom: 1px solid var(--color-border-muted);
        }

        .stat-list li:last-child {
          border-bottom: none;
        }

        .stat-result {
          padding: var(--space-3);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
        }

        .stat-result-bad {
          background: var(--color-error-subtle);
        }

        .stat-result-good {
          background: var(--color-success-subtle);
        }

        .stat-result-label {
          color: var(--color-text-secondary);
          margin-right: var(--space-2);
        }

        .stat-result-value {
          font-weight: 600;
        }

        .stat-result-bad .stat-result-value {
          color: var(--color-error);
        }

        .stat-result-good .stat-result-value {
          color: var(--color-success);
        }

        .story-section {
          margin-bottom: var(--space-16);
        }

        .story-card {
          background: linear-gradient(135deg, rgba(248, 81, 73, 0.1), rgba(248, 81, 73, 0.05));
          border-color: rgba(248, 81, 73, 0.3);
        }

        .story-header {
          margin-bottom: var(--space-4);
        }

        .story-badge {
          display: inline-block;
          background: var(--color-error);
          color: white;
          font-size: var(--text-xs);
          font-weight: 600;
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: var(--space-2);
        }

        .story-title {
          font-size: var(--text-2xl);
        }

        .story-content p {
          margin-bottom: var(--space-4);
          line-height: 1.7;
        }

        .story-lesson {
          background: var(--color-bg-tertiary);
          padding: var(--space-4);
          border-radius: var(--radius-md);
          border-left: 3px solid var(--color-warning);
        }

        .story-stats {
          display: flex;
          gap: var(--space-8);
          margin-top: var(--space-6);
          padding-top: var(--space-6);
          border-top: 1px solid var(--color-border-muted);
        }

        .story-stat {
          text-align: center;
        }

        .story-stat-value {
          display: block;
          font-family: var(--font-mono);
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--color-error);
        }

        .story-stat-label {
          font-size: var(--text-sm);
          color: var(--color-text-tertiary);
        }

        .learn-section {
          text-align: center;
          margin-bottom: var(--space-16);
        }

        .learn-title {
          font-size: var(--text-3xl);
          margin-bottom: var(--space-4);
        }

        .learn-subtitle {
          font-size: var(--text-lg);
          color: var(--color-text-secondary);
          max-width: 600px;
          margin: 0 auto var(--space-10);
        }

        .learn-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: var(--space-6);
          text-align: left;
        }

        .learn-item {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          transition: all var(--transition-base);
        }

        .learn-item:hover {
          border-color: var(--color-accent-primary);
          transform: translateY(-2px);
        }

        .learn-icon {
          font-size: var(--text-2xl);
          display: block;
          margin-bottom: var(--space-3);
        }

        .learn-item-title {
          font-size: var(--text-lg);
          margin-bottom: var(--space-2);
        }

        .learn-item-desc {
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
        }

        .cta-section {
          text-align: center;
          padding: var(--space-12);
        }

        .cta-text {
          font-size: var(--text-xl);
          color: var(--color-text-primary);
          margin-bottom: var(--space-4);
        }

        .cta-arrow {
          font-size: var(--text-3xl);
          color: var(--color-accent-primary);
          animation: bounce 2s infinite;
        }

        .cta-next {
          font-size: var(--text-sm);
          color: var(--color-text-tertiary);
          margin-top: var(--space-4);
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(10px); }
          60% { transform: translateY(5px); }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: var(--text-3xl);
          }

          .grid-cols-2 {
            grid-template-columns: 1fr;
          }

          .story-stats {
            flex-direction: column;
            gap: var(--space-4);
          }
        }
      `}</style>
    </div>
  )
}
