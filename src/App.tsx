import { useRef } from 'react'
import { motion } from 'framer-motion'
import Navbar from './components/Layout/Navbar'
import Footer from './components/Layout/Footer'
import WhyProfile from './sections/WhyProfile'
import HowProfilersWork from './sections/HowProfilersWork'
import BuildingFlameGraphs from './sections/BuildingFlameGraphs'
import ReadingFlameGraphs from './sections/ReadingFlameGraphs'
import CommonMistakes from './sections/CommonMistakes'
import Variations from './sections/Variations'
import GuidedPractice from './sections/GuidedPractice'
import MemoryProfiling from './sections/MemoryProfiling'
import TakingAction from './sections/TakingAction'

const sections = [
  { id: 'why-profile', label: 'Why Profile?' },
  { id: 'how-profilers-work', label: 'How Profilers Work' },
  { id: 'building-flame-graphs', label: 'Building Flame Graphs' },
  { id: 'reading-flame-graphs', label: 'Reading Flame Graphs' },
  { id: 'common-mistakes', label: 'Common Mistakes' },
  { id: 'variations', label: 'Variations' },
  { id: 'guided-practice', label: 'Guided Practice' },
  { id: 'memory-profiling', label: 'Memory Profiling' },
  { id: 'taking-action', label: 'Taking Action' },
]

function App() {
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})

  const scrollToSection = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="app">
      <Navbar sections={sections} onNavigate={scrollToSection} />
      
      <main>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <section 
            id="why-profile" 
            ref={(el) => { sectionRefs.current['why-profile'] = el }}
          >
            <WhyProfile />
          </section>

          <section 
            id="how-profilers-work" 
            ref={(el) => { sectionRefs.current['how-profilers-work'] = el }}
          >
            <HowProfilersWork />
          </section>

          <section 
            id="building-flame-graphs" 
            ref={(el) => { sectionRefs.current['building-flame-graphs'] = el }}
          >
            <BuildingFlameGraphs />
          </section>

          <section 
            id="reading-flame-graphs" 
            ref={(el) => { sectionRefs.current['reading-flame-graphs'] = el }}
          >
            <ReadingFlameGraphs />
          </section>

          <section 
            id="common-mistakes" 
            ref={(el) => { sectionRefs.current['common-mistakes'] = el }}
          >
            <CommonMistakes />
          </section>

          <section 
            id="variations" 
            ref={(el) => { sectionRefs.current['variations'] = el }}
          >
            <Variations />
          </section>

          <section 
            id="guided-practice" 
            ref={(el) => { sectionRefs.current['guided-practice'] = el }}
          >
            <GuidedPractice />
          </section>

          <section 
            id="memory-profiling" 
            ref={(el) => { sectionRefs.current['memory-profiling'] = el }}
          >
            <MemoryProfiling />
          </section>

          <section 
            id="taking-action" 
            ref={(el) => { sectionRefs.current['taking-action'] = el }}
          >
            <TakingAction />
          </section>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}

export default App
