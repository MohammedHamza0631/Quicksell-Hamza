import React, { useState } from 'react'
import Card from './Card'
import AddCard from './AddCard'
import DropIndicator from './DropIndicator'

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

  const sortedCards = [...filteredCards]
  if (sortBy === 'priority') {
    sortedCards.sort((a, b) => b.priority - a.priority)
  } else if (sortBy === 'title') {
    sortedCards.sort((a, b) => a.title.localeCompare(b.title))
  }

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
        {sortedCards.map(c => (
          <Card
            key={c.id}
            {...c}
            handleDragStart={handleDragStart}
            users={users}
            groupValue={groupValue}
          />
        ))}
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

export default Column
