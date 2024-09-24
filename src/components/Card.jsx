// Card.jsx
import React from 'react'
import { motion } from 'framer-motion'
import DropIndicator from './DropIndicator'
const Card = ({
  title,
  id,
  userId,
  priority,
  tag,
  handleDragStart,
  users,
  groupValue
}) => {
  const user = users.find(u => u.id === userId)
  const userInitials = user
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    : '?'

  const priorityMap = {
    4: { label: 'Urgent', color: 'bg-red-500' },
    3: { label: 'High', color: 'bg-orange-500' },
    2: { label: 'Medium', color: 'bg-yellow-500' },
    1: { label: 'Low', color: 'bg-green-500' },
    0: { label: 'No Priority', color: 'bg-gray-500' }
  }

  const priorityInfo = priorityMap[priority]

  return (
    <>
      <motion.div
        layout
        layoutId={id}
        draggable='true'
        onDragStart={e => handleDragStart(e, { id })}
        className='mb-2 cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing'
      >
        <div className='flex justify-between'>
          <span className='text-xs font-bold'>{id}</span>
          <div className='flex h-6 w-6 items-center justify-center rounded-full bg-neutral-600 text-xs text-white'>
            {userInitials}
          </div>
        </div>
        <p className='mt-2 text-sm text-neutral-100'>{title}</p>
        <div className='mt-2 flex items-center justify-between'>
          <div className={`h-3 w-3 ${priorityInfo.color} rounded`}></div>
          <span className='rounded bg-neutral-700 px-2 py-0.5 text-xs text-neutral-300'>
            {tag.join(', ')}
          </span>
        </div>
      </motion.div>
      <DropIndicator beforeId={id} groupValue={groupValue} />
    </>
  )
}

export default Card
