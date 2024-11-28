import React, { useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import { motion } from 'framer-motion'
import Modal from './Modal'

const AddCard = ({ groupBy, groupValue, setCards, users }) => {
  const [adding, setAdding] = useState(false)
  const [formData, setFormData] = useState({
    id: '',
    userId: '',
    title: '',
    priority: '',
    tag: ''
  })

  const handleSubmit = e => {
    e.preventDefault()

    if (!formData.title.trim().length || !formData.id.trim().length) return

    const newCard = {
      id: formData.id.trim(),
      title: formData.title.trim(),
      tag: formData.tag ? [formData.tag.trim()] : ['Feature Request'],
      userId: formData.userId || users[0]?.id || 'usr-1',
      status: groupBy === 'status' ? groupValue : 'Todo',
      priority:
        groupBy === 'priority' ? groupValue : parseInt(formData.priority) || 0
    }

    setCards(prev => [...prev, newCard])

    setAdding(false)
    setFormData({
      id: '',
      userId: '',
      title: '',
      priority: '',
      tag: ''
    })
  }

  return (
    <>
      <motion.button
        layout
        onClick={() => setAdding(true)}
        className='flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50'
      >
        <span>Add card</span>
        <FiPlus />
      </motion.button>

      <Modal isOpen={adding} onClose={() => setAdding(false)}>
        <h2 className='text-lg font-bold mb-4'>Add New Card</h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm mb-1'>ID:</label>
            <input
              type='text'
              value={formData.id}
              onChange={e => setFormData({ ...formData, id: e.target.value })}
              placeholder='CAM-11'
              className='w-full rounded bg-neutral-700 p-2 text-neutral-50'
              required
            />
          </div>
          <div>
            <label className='block text-sm mb-1'>User Name:</label>
            <select
              value={formData.userId}
              onChange={e =>
                setFormData({ ...formData, userId: e.target.value })
              }
              className='w-full rounded bg-neutral-700 p-2 text-neutral-50'
              required
            >
              <option value=''>Select User</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-sm mb-1'>Title:</label>
            <input
              type='text'
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder='Enter title'
              className='w-full rounded bg-neutral-700 p-2 text-neutral-50'
              required
            />
          </div>
          <div>
            <label className='block text-sm mb-1'>Priority:</label>
            <select
              value={formData.priority}
              onChange={e =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className='w-full rounded bg-neutral-700 p-2 text-neutral-50'
              required
            >
              <option value=''>Select Priority</option>
              <option value='4'>Urgent</option>
              <option value='3'>High</option>
              <option value='2'>Medium</option>
              <option value='1'>Low</option>
              <option value='0'>No Priority</option>
            </select>
          </div>
          <div>
            <label className='block text-sm mb-1'>Tags:</label>
            <input
              type='text'
              value={formData.tag}
              onChange={e => setFormData({ ...formData, tag: e.target.value })}
              placeholder='Feature Request'
              className='w-full rounded bg-neutral-700 p-2 text-neutral-50'
            />
          </div>
          <div className='flex justify-end gap-2'>
            <button
              type='button'
              onClick={() => setAdding(false)}
              className='px-4 py-2 text-sm text-neutral-400 hover:text-neutral-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-blue-600 text-sm rounded text-white hover:bg-blue-500'
            >
              Add Card
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default AddCard
