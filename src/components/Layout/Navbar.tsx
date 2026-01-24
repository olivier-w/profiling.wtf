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
      transition={{ duration: 0.4, ease: [0.215, 0.61, 0.355, 1] }}
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
          transition={{ duration: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
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
          height: 64px;
          z-index: var(--z-sticky);
          background: transparent;
          transition: background-color var(--duration-base) var(--ease-out),
                      backdrop-filter var(--duration-base) var(--ease-out),
                      border-color var(--duration-base) var(--ease-out);
        }

        .navbar-scrolled {
          background: rgba(10, 10, 10, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--surface);
        }

        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          position: relative;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: var(--text);
          min-height: 44px;
          touch-action: manipulation;
        }

        .navbar-logo {
          font-size: 1.25rem;
        }

        .navbar-title {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.125rem;
          background: linear-gradient(135deg, var(--flame-2), var(--flame-5));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .navbar-links {
          display: flex;
          gap: 0.25rem;
        }

        .navbar-link {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem 0.75rem;
          min-height: 44px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.75rem;
          cursor: pointer;
          touch-action: manipulation;
          transition: color var(--duration-fast) var(--ease-out),
                      background-color var(--duration-fast) var(--ease-out);
          border-radius: 0.375rem;
        }

        @media (hover: hover) and (pointer: fine) {
          .navbar-link:hover {
            color: var(--text);
            background: var(--surface);
          }
        }

        .navbar-link.active {
          color: var(--accent);
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
          background: var(--surface);
        }

        .navbar-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--flame-2), var(--flame-5));
          transition: width var(--duration-base) var(--ease-out);
        }

        .navbar-mobile-toggle {
          display: none;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.75rem;
          min-width: 44px;
          min-height: 44px;
          touch-action: manipulation;
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
          background: var(--text);
          transition: transform var(--duration-fast) var(--ease-out),
                      opacity var(--duration-fast) var(--ease-out);
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
          background: var(--surface);
          border-bottom: 1px solid var(--text-muted);
          padding: 1rem;
        }

        .navbar-mobile-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          min-height: 44px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.875rem;
          cursor: pointer;
          text-align: left;
          border-radius: 0.375rem;
          touch-action: manipulation;
          transition: background-color var(--duration-fast) var(--ease-out),
                      color var(--duration-fast) var(--ease-out);
        }

        @media (hover: hover) and (pointer: fine) {
          .navbar-mobile-link:hover {
            background: #1f1f1f;
            color: var(--text);
          }
        }

        .navbar-mobile-link.active {
          background: #1f1f1f;
          color: var(--accent);
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
