import React, { useState, useEffect } from 'react'
import { FiPlus, FiTrash } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { FaFire } from 'react-icons/fa'

export const CustomKanban = () => {
  return (
    <div>
      <Board />
    </div>
  )
}

const Board = () => {
  const [cards, setCards] = useState([])
  const [users, setUsers] = useState([])
  const [groupBy, setGroupBy] = useState(
    () => localStorage.getItem('groupBy') || 'status'
  )
  const [sortBy, setSortBy] = useState(
    () => localStorage.getItem('sortBy') || 'priority'
  )
  const [loading, setLoading] = useState(true)

  // Fetch data from the API
  useEffect(() => {
    fetch('https://api.quicksell.co/v1/internal/frontend-assignment')
      .then(response => response.json())
      .then(data => {
        setCards(data.tickets)
        setUsers(data.users)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching data:', error)
        setLoading(false)
      })
  }, [])

  // Persist user preferences
  useEffect(() => {
    localStorage.setItem('groupBy', groupBy)
  }, [groupBy])

  useEffect(() => {
    localStorage.setItem('sortBy', sortBy)
  }, [sortBy])

  if (loading) {
    return <div>Loading...</div>
  }

  // Generate columns based on grouping
  let columns = []
  if (groupBy === 'status') {
    columns = ['Backlog', 'Todo', 'In progress', 'Done', 'Cancelled']
  } else if (groupBy === 'priority') {
    const priorityOrder = [4, 3, 2, 1, 0]
    columns = priorityOrder.filter(priority =>
      cards.some(card => card.priority === priority)
    )
  } else if (groupBy === 'user') {
    const sortedUsers = users
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
    columns = sortedUsers
      .map(user => user.id)
      .filter(userId => cards.some(card => card.userId === userId))
  }

  const getColumnTitle = value => {
    if (groupBy === 'status') {
      return value
    } else if (groupBy === 'priority') {
      const priorityMap = {
        4: 'Urgent',
        3: 'High',
        2: 'Medium',
        1: 'Low',
        0: 'No Priority'
      }
      return priorityMap[value]
    } else if (groupBy === 'user') {
      const user = users.find(user => user.id === value)
      return user ? user.name : 'Unknown User'
    }
    return value
  }

  return (
    <div>
      {/* Controls for grouping and sorting */}
      <div className='flex justify-between p-4'>
        <div>
          <label htmlFor='groupBy'>Group By:</label>
          <select
            id='groupBy'
            value={groupBy}
            onChange={e => setGroupBy(e.target.value)}
            className='ml-2 rounded bg-neutral-800 text-neutral-50'
          >
            <option value='status'>Status</option>
            <option value='user'>User</option>
            <option value='priority'>Priority</option>
          </select>
        </div>
        <div>
          <label htmlFor='sortBy'>Sort By:</label>
          <select
            id='sortBy'
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className='ml-2 rounded bg-neutral-800 text-neutral-50'
          >
            <option value='priority'>Priority</option>
            <option value='title'>Title</option>
          </select>
        </div>
      </div>
      <div className='flex h-full w-full gap-3 overflow-scroll p-4'>
        {columns.map(columnValue => (
          <Column
            key={columnValue}
            title={getColumnTitle(columnValue)}
            groupBy={groupBy}
            groupValue={columnValue}
            cards={cards}
            setCards={setCards}
            users={users}
            sortBy={sortBy}
          />
        ))}
        <BurnBarrel setCards={setCards} />
      </div>
    </div>
  )
}

const Column = ({
  title,
  groupBy,
  groupValue,
  cards,
  setCards,
  users,
  sortBy
}) => {
  const [active, setActive] = useState(false)

  // Filter cards based on grouping
  const filteredCards = cards.filter(card => {
    if (groupBy === 'status') {
      return card.status === groupValue
    } else if (groupBy === 'priority') {
      return card.priority === groupValue
    } else if (groupBy === 'user') {
      return card.userId === groupValue
    }
    return false
  })

  // Sort cards based on sorting preference
  const sortedCards = [...filteredCards]
  if (sortBy === 'priority') {
    sortedCards.sort((a, b) => b.priority - a.priority)
  } else if (sortBy === 'title') {
    sortedCards.sort((a, b) => a.title.localeCompare(b.title))
  }

  // Drag and drop handlers
  const handleDragStart = (e, card) => {
    e.dataTransfer.setData('cardId', card.id)
  }

  const handleDragEnd = e => {
    const cardId = e.dataTransfer.getData('cardId')
    setActive(false)
    clearHighlights()

    const indicators = getIndicators()
    const { element } = getNearestIndicator(e, indicators)

    const before = element.dataset.before || '-1'

    if (before !== cardId) {
      let copy = [...cards]

      let cardToTransfer = copy.find(c => c.id === cardId)
      if (!cardToTransfer) return

      // Update the card's groupBy field to groupValue
      const updatedCard = { ...cardToTransfer }
      if (groupBy === 'status') {
        updatedCard.status = groupValue
      } else if (groupBy === 'priority') {
        updatedCard.priority = groupValue
      } else if (groupBy === 'user') {
        updatedCard.userId = groupValue
      }

      copy = copy.filter(c => c.id !== cardId)

      const moveToBack = before === '-1'

      if (moveToBack) {
        copy.push(updatedCard)
      } else {
        const insertAtIndex = copy.findIndex(el => el.id === before)
        if (insertAtIndex === undefined) return
        copy.splice(insertAtIndex, 0, updatedCard)
      }

      setCards(copy)
    }
  }

  const handleDragOver = e => {
    e.preventDefault()
    highlightIndicator(e)
    setActive(true)
  }

  const handleDragLeave = () => {
    clearHighlights()
    setActive(false)
  }

  const clearHighlights = els => {
    const indicators = els || getIndicators()
    indicators.forEach(i => {
      i.style.opacity = '0'
    })
  }

  const highlightIndicator = e => {
    const indicators = getIndicators()
    clearHighlights(indicators)
    const el = getNearestIndicator(e, indicators)
    el.element.style.opacity = '1'
  }

  const getNearestIndicator = (e, indicators) => {
    const DISTANCE_OFFSET = 50
    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = e.clientY - (box.top + DISTANCE_OFFSET)

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child }
        } else {
          return closest
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1]
      }
    )
    return el
  }

  const getIndicators = () => {
    return Array.from(
      document.querySelectorAll(`[data-group-value="${groupValue}"]`)
    )
  }

  return (
    <div className='w-56 shrink-0'>
      <div className='mb-3 flex items-center justify-between'>
        <h3 className='font-medium'>{title}</h3>
        <span className='rounded text-sm text-neutral-400'>
          {filteredCards.length}
        </span>
      </div>
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`h-full w-full transition-colors ${
          active ? 'bg-neutral-800/50' : 'bg-neutral-800/0'
        }`}
      >
        {sortedCards.map(c => {
          return (
            <Card
              key={c.id}
              {...c}
              handleDragStart={handleDragStart}
              users={users}
              groupValue={groupValue}
            />
          )
        })}
        <DropIndicator beforeId={null} groupValue={groupValue} />
        <AddCard
          groupBy={groupBy}
          groupValue={groupValue}
          setCards={setCards}
          users={users}
        />
      </div>
    </div>
  )
}

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
      <DropIndicator beforeId={id} groupValue={groupValue} />
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
    </>
  )
}

const DropIndicator = ({ beforeId, groupValue }) => {
  return (
    <div
      data-before={beforeId || '-1'}
      data-group-value={groupValue}
      className='my-0.5 h-0.5 w-full bg-violet-400 opacity-0'
    />
  )
}

const AddCard = ({ groupBy, groupValue, setCards, users }) => {
  const [text, setText] = useState('')
  const [adding, setAdding] = useState(false)

  const handleSubmit = e => {
    e.preventDefault()

    if (!text.trim().length) return

    const newCard = {
      id: Math.random().toString(),
      title: text.trim(),
      tag: ['Feature Request'],
      userId: groupBy === 'user' ? groupValue : users[0]?.id || 'usr-1',
      status: groupBy === 'status' ? groupValue : 'Todo',
      priority: groupBy === 'priority' ? groupValue : 0
    }

    setCards(prev => [...prev, newCard])

    setAdding(false)
  }

  return (
    <>
      {adding ? (
        <motion.form layout onSubmit={handleSubmit}>
          <textarea
            onChange={e => setText(e.target.value)}
            autoFocus
            placeholder='Add new task...'
            className='w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0'
          />
          <div className='mt-1.5 flex items-center justify-end gap-1.5'>
            <button
              onClick={() => setAdding(false)}
              className='px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50'
            >
              Close
            </button>
            <button
              type='submit'
              className='flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:bg-neutral-300'
            >
              <span>Add</span>
              <FiPlus />
            </button>
          </div>
        </motion.form>
      ) : (
        <motion.button
          layout
          onClick={() => setAdding(true)}
          className='flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50'
        >
          <span>Add card</span>
          <FiPlus />
        </motion.button>
      )}
    </>
  )
}

const BurnBarrel = ({ setCards }) => {
  const [active, setActive] = useState(false)

  const handleDragOver = e => {
    e.preventDefault()
    setActive(true)
  }

  const handleDragLeave = () => {
    setActive(false)
  }

  const handleDragEnd = e => {
    const cardId = e.dataTransfer.getData('cardId')
    setCards(prev => prev.filter(c => c.id !== cardId))
    setActive(false)
  }

  return (
    <div
      onDrop={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl ${
        active
          ? 'border-red-800 bg-red-800/20 text-red-500'
          : 'border-neutral-500 bg-neutral-500/20 text-neutral-500'
      }`}
    >
      {active ? <FaFire className='animate-bounce' /> : <FiTrash />}
    </div>
  )
}
