import { useState } from 'react'
import MainMenu from './MainMenu'
import BaseTimer from './BaseTimer'
import KptProtocol from './KptProtocol'
import Perimeter from './Perimeter'

function App() {
  const [currentApp, setCurrentApp] = useState('menu')

  return (
    <div className="w-full min-h-screen">
      {currentApp === 'menu' && <MainMenu setApp={setCurrentApp} />}
      {currentApp === 'base' && <BaseTimer goBack={() => setCurrentApp('menu')} />}
      {currentApp === 'kpt' && <KptProtocol goBack={() => setCurrentApp('menu')} />}
      {currentApp === 'perimetr' && <Perimeter goBack={() => setCurrentApp('menu')} />}
    </div>
  )
}

export default App
