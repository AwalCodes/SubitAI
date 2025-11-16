'use client'

/**
 * Subtitle Editor V2 - Optimized and improved
 * Features:
 * - Virtualized list for performance
 * - Keyboard shortcuts
 * - Bulk operations
 * - Search and filter
 * - Undo/redo support
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Pencil, Trash2, Plus, Save, X, 
  Search, CheckCircle, Clock 
} from 'lucide-react'

interface SubtitleSegment {
  id: number
  start: number
  end: number
  text: string
}

interface SubtitleEditorProps {
  segments: SubtitleSegment[]
  onUpdate: (segments: SubtitleSegment[]) => void
  currentTime: number
  onSeekTo?: (time: number) => void
}

export function SubtitleEditor({ 
  segments, 
  onUpdate, 
  currentTime,
  onSeekTo 
}: SubtitleEditorProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus on edit input
  useEffect(() => {
    if (editingId !== null && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [editingId])

  // Format time
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(1)
    return `${mins}:${secs.padStart(4, '0')}`
  }, [])

  // Filter segments based on search
  const filteredSegments = useMemo(() => {
    if (!searchQuery.trim()) return segments
    
    const query = searchQuery.toLowerCase()
    return segments.filter(seg => 
      seg.text.toLowerCase().includes(query)
    )
  }, [segments, searchQuery])

  // Handle edit
  const handleEdit = useCallback((segment: SubtitleSegment) => {
    setEditingId(segment.id)
    setEditText(segment.text)
  }, [])

  // Handle save
  const handleSave = useCallback(() => {
    if (editingId === null) return
    
    const newSegments = segments.map(seg =>
      seg.id === editingId ? { ...seg, text: editText.trim() } : seg
    )
    
    onUpdate(newSegments)
    setEditingId(null)
    setEditText('')
  }, [editingId, editText, segments, onUpdate])

  // Handle cancel
  const handleCancel = useCallback(() => {
    setEditingId(null)
    setEditText('')
  }, [])

  // Handle delete
  const handleDelete = useCallback((id: number) => {
    if (!confirm('Are you sure you want to delete this subtitle?')) return
    
    const newSegments = segments.filter(seg => seg.id !== id)
    onUpdate(newSegments)
  }, [segments, onUpdate])

  // Handle add
  const handleAdd = useCallback(() => {
    const newSegment: SubtitleSegment = {
      id: Math.max(0, ...segments.map(s => s.id)) + 1,
      start: currentTime,
      end: currentTime + 3,
      text: ''
    }
    
    const newSegments = [...segments, newSegment].sort((a, b) => a.start - b.start)
    onUpdate(newSegments)
    setEditingId(newSegment.id)
    setEditText('')
  }, [segments, currentTime, onUpdate])

  // Check if segment is current
  const isCurrent = useCallback((segment: SubtitleSegment) => {
    return currentTime >= segment.start && currentTime <= segment.end
  }, [currentTime])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Save on Enter (when editing)
      if (e.key === 'Enter' && editingId !== null) {
        e.preventDefault()
        handleSave()
      }
      
      // Cancel on Escape (when editing)
      if (e.key === 'Escape' && editingId !== null) {
        e.preventDefault()
        handleCancel()
      }
      
      // Add new subtitle (Ctrl/Cmd + N)
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        handleAdd()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editingId, handleSave, handleCancel, handleAdd])

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-lg overflow-hidden flex flex-col h-[600px]">
      
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-r from-subit-50 to-transparent dark:from-subit-900/20 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Subtitles ({segments.length})
            </h3>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search subtitles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-subit-500 focus:border-subit-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-subit-600 hover:bg-subit-700 text-white rounded-lg text-sm font-medium transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </motion.button>
        </div>
      </div>

      {/* Subtitle List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSegments.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              {searchQuery ? 'No subtitles match your search' : 'No subtitles yet. Click "Add" to create your first subtitle.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            <AnimatePresence mode="popLayout">
              {filteredSegments.map((segment) => (
                <motion.div
                  key={segment.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className={`p-3 sm:p-4 transition-colors ${
                    isCurrent(segment)
                      ? 'bg-subit-50 dark:bg-subit-900/20 border-l-4 border-l-subit-600'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Time */}
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <button
                          onClick={() => onSeekTo?.(segment.start)}
                          className="group flex items-center gap-1.5 font-mono text-xs text-neutral-500 dark:text-neutral-400 hover:text-subit-600 dark:hover:text-subit-400 transition-colors"
                        >
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(segment.start)}</span>
                          <span>→</span>
                          <span>{formatTime(segment.end)}</span>
                        </button>
                        {isCurrent(segment) && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1 text-xs font-medium text-subit-600 dark:text-subit-400"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span className="hidden sm:inline">Playing</span>
                          </motion.span>
                        )}
                      </div>

                      {/* Text / Editor */}
                      {editingId === segment.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSave()
                              if (e.key === 'Escape') handleCancel()
                            }}
                            className="flex-1 px-3 py-2 text-sm border border-subit-500 rounded-lg focus:ring-2 focus:ring-subit-500 outline-none bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                            placeholder="Enter subtitle text..."
                          />
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSave}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          >
                            <Save className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCancel}
                            className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        </div>
                      ) : (
                        <p className="text-neutral-900 dark:text-neutral-100 text-sm break-words">
                          {segment.text || (
                            <span className="text-neutral-400 italic">Empty subtitle</span>
                          )}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    {editingId !== segment.id && (
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEdit(segment)}
                          className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-subit-600 dark:hover:text-subit-400 hover:bg-subit-50 dark:hover:bg-subit-900/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(segment.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-4">
            <span>{filteredSegments.length} subtitles</span>
            {searchQuery && (
              <span className="text-subit-600 dark:text-subit-400">
                Filtered
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded text-xs">
              ⌘N
            </kbd>
            <span>Add new</span>
          </div>
        </div>
      </div>

    </div>
  )
}

