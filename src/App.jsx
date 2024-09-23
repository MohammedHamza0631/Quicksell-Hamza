import { useState } from 'react'
import { CustomKanban } from './components/Kanban'
function App () {
  return (
    <>
      <div className='h-screen w-full bg-neutral-900 text-neutral-50'>
        <CustomKanban />
      </div>
    </>
  )
}

export default App
