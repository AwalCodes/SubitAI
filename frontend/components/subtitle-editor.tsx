'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Pencil, Trash2, Plus, Save } from 'lucide-react'

interface SubtitleSegment {
  id: string
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
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editText, setEditText] = React.useState('')

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(2)
    return `${mins}:${secs.padStart(5, '0')}`
  }

  const handleEdit = (segment: SubtitleSegment) => {
    setEditingId(segment.id)
    setEditText(segment.text)
  }

  const handleSave = () => {
    if (!editingId) return
    
    onUpdate(
      segments.map(seg =>
        seg.id === editingId ? { ...seg, text: editText } : seg
      )
    )
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    onUpdate(segments.filter(seg => seg.id !== id))
  }

  const handleAdd = () => {
    const newSegment: SubtitleSegment = {
      id: Date.now().toString(),
      start: currentTime,
      end: currentTime + 3,
      text: ''
    }
    onUpdate([...segments, newSegment].sort((a, b) => a.start - b.start))
    setEditingId(newSegment.id)
    setEditText('')
  }

  const isCurrent = (segment: SubtitleSegment) => {
    return currentTime >= segment.start && currentTime <= segment.end
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-lg overflow-hidden">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-r from-subit-50 to-transparent dark:from-subit-900/20">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Subtitles
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            className="flex items-center gap-2 px-3 py-1.5 bg-subit-500 hover:bg-subit-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </motion.button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {segments.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              No subtitles yet. Click &quot;Add&quot; to create your first subtitle.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {segments.map((segment, index) => (
              <motion.div
                key={segment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 transition-colors ${
                  isCurrent(segment)
                    ? 'bg-subit-50 dark:bg-subit-900/20 border-l-4 border-l-subit-500'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => onSeekTo?.(segment.start)}
                        className="font-mono text-xs text-neutral-500 dark:text-neutral-400 hover:text-subit-600 dark:hover:text-subit-400 transition-colors"
                      >
                        {formatTime(segment.start)} → {formatTime(segment.end)}
                      </button>
                    </div>

                    {editingId === segment.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                          className="flex-1 px-3 py-2 border border-subit-500 rounded-lg focus:ring-2 focus:ring-subit-500 outline-none bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                          autoFocus
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSave}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        >
                          <Save className="w-4 h-4" />
                        </motion.button>
                      </div>
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100 text-sm">
                        {segment.text || <span className="text-neutral-400 italic">Empty subtitle</span>}
                      </p>
                    )}
                  </div>

                  {editingId !== segment.id && (
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(segment)}
                        className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-subit-600 dark:hover:text-subit-400 hover:bg-subit-50 dark:hover:bg-subit-900/20 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(segment.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

