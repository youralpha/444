import { useState } from 'react'
import MainMenu from './MainMenu'
import BaseTimer from './BaseTimer'
import KptProtocol from './KptProtocol'
import Perimeter from './Perimeter'

function App() {
  const [currentApp, setCurrentApp] = useState('menu')

  return (
    <div className="w-full min-h-screen">
      {currentApp === 'menu' && <MainMenu setCurrentApp={setCurrentApp} />}
      {currentApp === 'base' && <BaseTimer setCurrentApp={setCurrentApp} />}
      {currentApp === 'kpt' && <KptProtocol setCurrentApp={setCurrentApp} />}
      {currentApp === 'perimetr' && <Perimeter setCurrentApp={setCurrentApp} />}
    </div>
  )
}

export default App
