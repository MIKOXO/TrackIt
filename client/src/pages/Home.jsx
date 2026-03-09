import React from 'react'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import HeroSection from '../components/home/HeroSection.jsx'
import ProblemSection from '../components/home/ProblemSection.jsx'
import FeatureGrid from '../components/home/FeatureGrid.jsx'
import HowItWorks from '../components/home/HowItWorks.jsx'

const Home = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-trackit-background dark:text-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.95),_rgba(2,6,23,1)_70%)]" />
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <FeatureGrid />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}

export default Home
