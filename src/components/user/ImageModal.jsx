import React from "react";
import { X } from "lucide-react"
import { useState } from "react"
import PropTypes from "prop-types"

export function ImageModal({ src, alt, onClose }) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })

  const handleTouchStart = (e) => {
    setIsDragging(true)
    setStartPosition({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y,
    })
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    setPosition({
      x: e.touches[0].clientX - startPosition.x,
      y: e.touches[0].clientY - startPosition.y,
    })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handlePinchZoom = (e) => {
    if (e.touches.length !== 2) return

    const touch1 = e.touches[0]
    const touch2 = e.touches[1]
    const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)

    setScale((prevScale) => {
      const newScale = prevScale + distance * 0.01
      return Math.min(Math.max(1, newScale), 4)
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full h-full">
        <button onClick={onClose} className="absolute right-4 top-4 text-white z-50 p-2 rounded-full bg-black/50">
          <X className="h-6 w-6" />
        </button>
        <div
          className="w-full h-full overflow-hidden touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={(e) => {
            handleTouchMove(e)
            handlePinchZoom(e)
          }}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={src || "/placeholder.svg"}
            alt={alt}
            className="w-full h-full object-contain"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? "none" : "transform 0.2s",
            }}
          />
        </div>
      </div>
    </div>
  )
}

// Add PropTypes for type checking
ImageModal.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
}

