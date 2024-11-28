import React from 'react'

const Header = ({ groupBy, setGroupBy, sortBy, setSortBy }) => {
  return (
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
  )
}

export default Header
