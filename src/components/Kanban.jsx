import React from 'react'
import Board from './Board'

export const CustomKanban = () => {
  return (
    <div className='h-screen w-full bg-neutral-900 text-neutral-50 overflow-scroll hide-scrollbar'>
      <Board />
    </div>
  )
}
