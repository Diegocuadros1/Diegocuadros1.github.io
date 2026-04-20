import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Description from './components/Description'
import Examples from './components/Examples'
import LearnGroovy from './components/LearnGroovy'
import Credits from './components/Credits'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <div className="divider" />
        <Description />
        <div className="divider" />
        <LearnGroovy />
        <div className="divider" />
        <Examples />
        <div className="divider" />
        <Credits />
      </main>
    </>
  )
}

export default App
