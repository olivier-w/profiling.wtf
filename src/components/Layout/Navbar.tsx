import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Section {
  id: string
  label: string
}

interface NavbarProps {
  sections: Section[]
  onNavigate: (id: string) => void
}

export default function Navbar({ sections, onNavigate }: NavbarProps) {
  const [activeSection, setActiveSection] = useState<string>('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)

      // Find current section
      const sectionElements = sections.map(s => ({
        id: s.id,
        element: document.getElementById(s.id)
      }))

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i]
        if (section.element) {
          const rect = section.element.getBoundingClientRect()
          if (rect.top <= 150) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sections])

  const handleNavigate = (id: string) => {
    onNavigate(id)
    setIsMobileMenuOpen(false)
  }

  return (
    <motion.nav
      className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="navbar-container">
        <a href="#" className="navbar-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="navbar-logo">🔥</span>
          <span className="navbar-title">profiling.wtf</span>
        </a>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          {sections.map((section, index) => (
            <button
              key={section.id}
              className={`navbar-link ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => handleNavigate(section.id)}
            >
              <span className="navbar-link-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="navbar-link-label">{section.label}</span>
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="navbar-progress">
          <div 
            className="navbar-progress-bar"
            style={{
              width: `${((sections.findIndex(s => s.id === activeSection) + 1) / sections.length) * 100}%`
            }}
          />
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="navbar-mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div 
          className="navbar-mobile-menu"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {sections.map((section, index) => (
            <button
              key={section.id}
              className={`navbar-mobile-link ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => handleNavigate(section.id)}
            >
              <span className="navbar-link-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="navbar-link-label">{section.label}</span>
            </button>
          ))}
        </motion.div>
      )}

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: var(--navbar-height);
          z-index: var(--z-fixed);
          background: transparent;
          transition: all var(--transition-base);
        }

        .navbar-scrolled {
          background: rgba(13, 17, 23, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--color-border-muted);
        }

        .navbar-container {
          max-width: var(--max-width-content);
          margin: 0 auto;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--space-6);
          position: relative;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          text-decoration: none;
          color: var(--color-text-primary);
        }

        .navbar-logo {
          font-size: var(--text-xl);
        }

        .navbar-title {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: var(--text-lg);
          background: linear-gradient(135deg, var(--color-flame-warm), var(--color-flame-hot));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .navbar-links {
          display: flex;
          gap: var(--space-1);
        }

        .navbar-link {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-2) var(--space-3);
          background: transparent;
          border: none;
          color: var(--color-text-tertiary);
          font-size: var(--text-xs);
          cursor: pointer;
          transition: all var(--transition-fast);
          border-radius: var(--radius-md);
        }

        .navbar-link:hover {
          color: var(--color-text-primary);
          background: var(--color-bg-tertiary);
        }

        .navbar-link.active {
          color: var(--color-accent-primary);
        }

        .navbar-link-number {
          font-family: var(--font-mono);
          opacity: 0.5;
        }

        .navbar-link-label {
          display: none;
        }

        @media (min-width: 1200px) {
          .navbar-link-label {
            display: inline;
          }
        }

        .navbar-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--color-border-muted);
        }

        .navbar-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--color-flame-warm), var(--color-flame-hot));
          transition: width var(--transition-base);
        }

        .navbar-mobile-toggle {
          display: none;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: var(--space-2);
        }

        .hamburger {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 20px;
        }

        .hamburger span {
          display: block;
          height: 2px;
          background: var(--color-text-primary);
          transition: all var(--transition-fast);
        }

        .hamburger.open span:nth-child(1) {
          transform: rotate(45deg) translate(4px, 4px);
        }

        .hamburger.open span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.open span:nth-child(3) {
          transform: rotate(-45deg) translate(4px, -4px);
        }

        .navbar-mobile-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border-default);
          padding: var(--space-4);
        }

        .navbar-mobile-link {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          width: 100%;
          padding: var(--space-3) var(--space-4);
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          font-size: var(--text-sm);
          cursor: pointer;
          text-align: left;
          border-radius: var(--radius-md);
        }

        .navbar-mobile-link:hover,
        .navbar-mobile-link.active {
          background: var(--color-bg-tertiary);
          color: var(--color-text-primary);
        }

        .navbar-mobile-link.active {
          color: var(--color-accent-primary);
        }

        @media (max-width: 768px) {
          .navbar-links {
            display: none;
          }

          .navbar-mobile-toggle {
            display: block;
          }

          .navbar-mobile-menu {
            display: block;
          }
        }
      `}</style>
    </motion.nav>
  )
}
