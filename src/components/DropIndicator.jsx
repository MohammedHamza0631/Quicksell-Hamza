// DropIndicator.jsx
import React from 'react'

const DropIndicator = ({ beforeId, groupValue }) => {
  return (
    <div
      data-before={beforeId || '-1'}
      data-group-value={groupValue}
      className='my-0.5 h-0.5 w-full bg-violet-400 opacity-0'
    />
  )
}

export default DropIndicator
