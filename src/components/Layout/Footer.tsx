export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">🔥</span>
            <span className="footer-title">profiling.wtf</span>
          </div>
          <p className="footer-tagline">
            Learn code profiling & flame graphs through interactive examples.
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-section">
            <h4>Resources</h4>
            <a href="https://www.brendangregg.com/flamegraphs.html" target="_blank" rel="noopener noreferrer">
              Brendan Gregg's Flame Graphs
            </a>
            <a href="https://github.com/brendangregg/FlameGraph" target="_blank" rel="noopener noreferrer">
              FlameGraph Tools
            </a>
            <a href="https://docs.sentry.io/product/explore/profiling/" target="_blank" rel="noopener noreferrer">
              Sentry Profiling Docs
            </a>
          </div>

          <div className="footer-section">
            <h4>Tools</h4>
            <a href="https://github.com/jlfwong/speedscope" target="_blank" rel="noopener noreferrer">
              Speedscope
            </a>
            <a href="https://github.com/nicholasbishop/nicholasblog/flamegraph" target="_blank" rel="noopener noreferrer">
              d3-flame-graph
            </a>
            <a href="https://perf.wiki.kernel.org/" target="_blank" rel="noopener noreferrer">
              Linux Perf
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            Made with 🔥 for developers who want to understand performance.
          </p>
          <p className="footer-credit">
            Flame graphs invented by{' '}
            <a href="https://www.brendangregg.com/" target="_blank" rel="noopener noreferrer">
              Brendan Gregg
            </a>
          </p>
        </div>
      </div>

      <style>{`
        .footer {
          background: var(--color-bg-secondary);
          border-top: 1px solid var(--color-border-default);
          padding: var(--space-16) var(--space-6);
          margin-top: var(--space-16);
        }

        .footer-container {
          max-width: var(--max-width-content);
          margin: 0 auto;
        }

        .footer-content {
          margin-bottom: var(--space-8);
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-2);
        }

        .footer-logo {
          font-size: var(--text-2xl);
        }

        .footer-title {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: var(--text-xl);
          background: linear-gradient(135deg, var(--color-flame-warm), var(--color-flame-hot));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .footer-tagline {
          color: var(--color-text-secondary);
          font-size: var(--text-sm);
        }

        .footer-links {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--space-8);
          margin-bottom: var(--space-8);
          padding-bottom: var(--space-8);
          border-bottom: 1px solid var(--color-border-muted);
        }

        .footer-section h4 {
          font-family: var(--font-heading);
          font-size: var(--text-sm);
          color: var(--color-text-primary);
          margin-bottom: var(--space-3);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .footer-section a {
          display: block;
          color: var(--color-text-secondary);
          font-size: var(--text-sm);
          padding: var(--space-1) 0;
          transition: color var(--transition-fast);
        }

        .footer-section a:hover {
          color: var(--color-accent-primary);
        }

        .footer-bottom {
          text-align: center;
        }

        .footer-bottom p {
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
          margin-bottom: var(--space-2);
        }

        .footer-credit {
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
        }

        .footer-credit a {
          color: var(--color-accent-primary);
        }
      `}</style>
    </footer>
  )
}
