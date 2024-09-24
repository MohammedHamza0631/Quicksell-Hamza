// Board.jsx
import React, { useState, useEffect } from 'react'
import Header from './Header'
import Column from './Column'
import BurnBarrel from './BurnBarrel'

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
    // Always include all statuses
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
      {/* Header Component */}
      <Header
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <div className='flex h-full w-full gap-3 overflow-scroll p-4 hide-scrollbar'>
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

export default Board
