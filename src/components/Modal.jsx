// Modal.jsx
import React from 'react'

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null
  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
      onClick={onClose}
    >
      <div
        className='bg-neutral-800 rounded-lg p-6 text-neutral-50 w-96'
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className='float-right text-neutral-400 hover:text-neutral-100'
        >
          X
        </button>
        {children}
      </div>
    </div>
  )
}

export default Modal
