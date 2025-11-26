'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/lib/providers'
import Link from 'next/link'
import { 
  Type, 
  Palette, 
  Move, 
  Sparkles, 
  Upload, 
  Lock, 
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SubtitleStyle {
  fontFamily: string
  fontSize: number
  fontColor: string
  backgroundColor: string
  outlineColor: string
  outlineWidth: number
  position: { x: number; y: number }
  alignment: 'left' | 'center' | 'right'
  animation?: {
    type: 'fade' | 'slide' | 'bounce' | 'zoom' | null
    duration: number
  }
  customFont?: string // For premium custom font uploads
}

interface SubtitleCustomizerProps {
  style: SubtitleStyle
  onStyleChange: (style: SubtitleStyle) => void
}

// Basic fonts (Free plan)
const BASIC_FONTS = [
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Helvetica', value: 'Helvetica, sans-serif' },
  { name: 'Times New Roman', value: 'Times New Roman, serif' },
  { name: 'Courier New', value: 'Courier New, monospace' },
  { name: 'Verdana', value: 'Verdana, sans-serif' }
]

// Full font library (Pro plan)
const PRO_FONTS = [
  ...BASIC_FONTS,
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif' },
  { name: 'Lato', value: 'Lato, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif' },
  { name: 'Raleway', value: 'Raleway, sans-serif' },
  { name: 'Playfair Display', value: 'Playfair Display, serif' },
  { name: 'Merriweather', value: 'Merriweather, serif' },
  { name: 'Source Sans Pro', value: 'Source Sans Pro, sans-serif' },
  { name: 'Ubuntu', value: 'Ubuntu, sans-serif' }
]

// Basic colors (Free plan)
const BASIC_COLORS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Black', value: '#000000' },
  { name: 'Yellow', value: '#FFFF00' },
  { name: 'Red', value: '#FF0000' },
  { name: 'Green', value: '#00FF00' },
  { name: 'Blue', value: '#0000FF' }
]

// Advanced colors (Pro plan)
const ADVANCED_COLORS = [
  ...BASIC_COLORS,
  { name: 'Orange', value: '#FFA500' },
  { name: 'Purple', value: '#800080' },
  { name: 'Cyan', value: '#00FFFF' },
  { name: 'Magenta', value: '#FF00FF' },
  { name: 'Lime', value: '#00FF00' },
  { name: 'Pink', value: '#FFC0CB' },
  { name: 'Gold', value: '#FFD700' },
  { name: 'Silver', value: '#C0C0C0' },
  { name: 'Navy', value: '#000080' },
  { name: 'Teal', value: '#008080' }
]

// Gradient presets (Premium plan)
const GRADIENT_PRESETS = [
  { name: 'Violet to Fuchsia', value: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' },
  { name: 'Blue to Cyan', value: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)' },
  { name: 'Orange to Red', value: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)' },
  { name: 'Green to Emerald', value: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
  { name: 'Purple to Pink', value: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)' },
  { name: 'Sunset', value: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 50%, #EC4899 100%)' }
]

const ANIMATION_TYPES = [
  { name: 'Fade In/Out', value: 'fade' },
  { name: 'Slide Up', value: 'slide' },
  { name: 'Bounce', value: 'bounce' },
  { name: 'Zoom', value: 'zoom' }
]

export function SubtitleCustomizer({ style, onStyleChange }: SubtitleCustomizerProps) {
  const { user, subscription } = useUser()
  const tier = subscription?.plan || user?.subscription_tier || 'free'
  const [activeTab, setActiveTab] = useState<'font' | 'color' | 'position' | 'animation'>('font')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['font']))
  const [customFontFile, setCustomFontFile] = useState<File | null>(null)

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const updateStyle = (updates: Partial<SubtitleStyle>) => {
    onStyleChange({ ...style, ...updates })
  }

  const handleFontUpload = async (file: File) => {
    if (tier !== 'premium') {
      toast.error('Custom font uploads are only available for Premium plans')
      return
    }

    // Validate font file
    const validExtensions = ['.ttf', '.otf', '.woff', '.woff2']
    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    
    if (!validExtensions.includes(ext)) {
      toast.error('Please upload a valid font file (.ttf, .otf, .woff, .woff2)')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Font file size must be less than 5MB')
      return
    }

    // In a real implementation, you would upload to Supabase Storage
    // For now, we'll use a data URL
    const reader = new FileReader()
    reader.onload = (e) => {
      const fontName = file.name.replace(/\.[^/.]+$/, '')
      setCustomFontFile(file)
      updateStyle({ 
        customFont: fontName,
        fontFamily: `"${fontName}", sans-serif`
      })
      toast.success('Custom font loaded successfully')
    }
    reader.readAsDataURL(file)
  }

  const availableFonts = tier === 'premium' 
    ? [...PRO_FONTS, ...(style.customFont ? [{ name: style.customFont, value: `"${style.customFont}", sans-serif` }] : [])]
    : tier === 'pro' 
    ? PRO_FONTS 
    : BASIC_FONTS

  const availableColors = tier === 'premium'
    ? [...ADVANCED_COLORS, ...GRADIENT_PRESETS.map(g => ({ name: g.name, value: g.value, isGradient: true }))]
    : tier === 'pro'
    ? ADVANCED_COLORS
    : BASIC_COLORS

  const canPosition = tier !== 'free'
  const canAnimate = tier === 'premium'

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Type className="w-5 h-5 text-violet-400" />
        Subtitle Customization
      </h3>

      {/* Font Section */}
      <div className="border border-slate-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('font')}
          className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-violet-400" />
            <span className="text-white font-medium">Font</span>
          </div>
          {expandedSections.has('font') ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
        
        {expandedSections.has('font') && (
          <div className="p-4 space-y-4 border-t border-slate-700">
            {/* Font Family */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Font Family
              </label>
              <select
                value={style.fontFamily}
                onChange={(e) => updateStyle({ fontFamily: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {availableFonts.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Font Upload (Premium only) */}
            {tier === 'premium' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Upload Custom Font
                </label>
                <label className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                  <Upload className="w-4 h-4 text-violet-400" />
                  <span className="text-sm text-slate-300">
                    {customFontFile ? customFontFile.name : 'Choose font file (.ttf, .otf, .woff, .woff2)'}
                  </span>
                  <input
                    type="file"
                    accept=".ttf,.otf,.woff,.woff2"
                    onChange={(e) => e.target.files?.[0] && handleFontUpload(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Font Size: {style.fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="72"
                value={style.fontSize}
                onChange={(e) => updateStyle({ fontSize: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Color Section */}
      <div className="border border-slate-700 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('color')}
          className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-violet-400" />
            <span className="text-white font-medium">Colors</span>
            {tier === 'premium' && (
              <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded">Gradients</span>
            )}
          </div>
          {expandedSections.has('color') ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
        
        {expandedSections.has('color') && (
          <div className="p-4 space-y-4 border-t border-slate-700">
            {/* Font Color */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Font Color
              </label>
              <div className="grid grid-cols-6 gap-2 mb-2">
                {availableColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      if (color.isGradient) {
                        updateStyle({ fontColor: color.value })
                      } else {
                        updateStyle({ fontColor: color.value })
                      }
                    }}
                    className={`w-full h-10 rounded-lg border-2 transition-all ${
                      style.fontColor === color.value
                        ? 'border-violet-500 ring-2 ring-violet-500/50'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                    style={{
                      background: color.isGradient ? color.value : color.value,
                      backgroundColor: color.isGradient ? undefined : color.value
                    }}
                    title={color.name}
                  />
                ))}
              </div>
              {tier === 'pro' || tier === 'premium' ? (
                <input
                  type="color"
                  value={style.fontColor.startsWith('#') ? style.fontColor : '#FFFFFF'}
                  onChange={(e) => updateStyle({ fontColor: e.target.value })}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Lock className="w-3 h-3" />
                  <span>Upgrade to Pro for custom colors</span>
                </div>
              )}
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Background Color
              </label>
              <div className="grid grid-cols-6 gap-2 mb-2">
                {BASIC_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => updateStyle({ backgroundColor: color.value })}
                    className={`w-full h-10 rounded-lg border-2 transition-all ${
                      style.backgroundColor === color.value
                        ? 'border-violet-500 ring-2 ring-violet-500/50'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <input
                type="color"
                value={style.backgroundColor.startsWith('#') ? style.backgroundColor : '#000000'}
                onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Outline */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Outline Width: {style.outlineWidth}px
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={style.outlineWidth}
                onChange={(e) => updateStyle({ outlineWidth: parseInt(e.target.value) })}
                className="w-full"
              />
              <input
                type="color"
                value={style.outlineColor.startsWith('#') ? style.outlineColor : '#000000'}
                onChange={(e) => updateStyle({ outlineColor: e.target.value })}
                className="w-full h-10 rounded-lg cursor-pointer mt-2"
              />
            </div>
          </div>
        )}
      </div>

      {/* Position Section (Pro and Premium) */}
      {canPosition && (
        <div className="border border-slate-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('position')}
            className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Move className="w-4 h-4 text-violet-400" />
              <span className="text-white font-medium">
                Position {tier === 'premium' ? '(Free)' : '(Basic)'}
              </span>
            </div>
            {expandedSections.has('position') ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
          
          {expandedSections.has('position') && (
            <div className="p-4 space-y-4 border-t border-slate-700">
              {/* Horizontal Position */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Horizontal: {style.position.x}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={style.position.x}
                  onChange={(e) => updateStyle({ 
                    position: { ...style.position, x: parseInt(e.target.value) }
                  })}
                  className="w-full"
                />
              </div>

              {/* Vertical Position */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Vertical: {style.position.y}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={style.position.y}
                  onChange={(e) => updateStyle({ 
                    position: { ...style.position, y: parseInt(e.target.value) }
                  })}
                  className="w-full"
                />
              </div>

              {/* Alignment */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Text Alignment
                </label>
                <div className="flex gap-2">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => updateStyle({ alignment: align })}
                      className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                        style.alignment === align
                          ? 'bg-violet-500/20 border-violet-500 text-white'
                          : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {align.charAt(0).toUpperCase() + align.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Animation Section (Premium only) */}
      {canAnimate && (
        <div className="border border-slate-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('animation')}
            className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-white font-medium">Animation Effects</span>
              <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded">Premium</span>
            </div>
            {expandedSections.has('animation') ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
          
          {expandedSections.has('animation') && (
            <div className="p-4 space-y-4 border-t border-slate-700">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Animation Type
                </label>
                <select
                  value={style.animation?.type || 'none'}
                  onChange={(e) => updateStyle({ 
                    animation: { 
                      type: e.target.value === 'none' ? null : e.target.value as any,
                      duration: style.animation?.duration || 0.5
                    }
                  })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="none">None</option>
                  {ANIMATION_TYPES.map((anim) => (
                    <option key={anim.value} value={anim.value}>
                      {anim.name}
                    </option>
                  ))}
                </select>
              </div>

              {style.animation?.type && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Duration: {style.animation.duration}s
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.1"
                    value={style.animation.duration}
                    onChange={(e) => updateStyle({ 
                      animation: { 
                        ...style.animation!,
                        duration: parseFloat(e.target.value)
                      }
                    })}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Feature Lock Messages */}
      {!canPosition && (
        <div className="flex items-center gap-2 p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
          <Lock className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-400">
            Upgrade to <Link href="/pricing" className="text-violet-400 hover:underline">Pro</Link> for positioning controls
          </span>
        </div>
      )}

      {!canAnimate && (
        <div className="flex items-center gap-2 p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
          <Lock className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-400">
            Upgrade to <Link href="/pricing" className="text-amber-400 hover:underline">Premium</Link> for animation effects
          </span>
        </div>
      )}
    </div>
  )
}

