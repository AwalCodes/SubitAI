'use client'

import { SubtitleStyle } from './SubtitleEditor'
import { Settings2, Type, Palette, Move, Sparkles } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

interface TemplateEditorProps {
    style: SubtitleStyle;
    onChange: (newStyle: Partial<SubtitleStyle>) => void;
}

/** Convert transparent/rgba to a hex fallback for <input type="color"> */
function toHexColor(color: string): string {
    if (!color || color === 'transparent' || color.startsWith('rgba')) return '#000000'
    if (color.startsWith('#') && color.length >= 7) return color.slice(0, 7)
    if (color.startsWith('#') && color.length === 4) {
        const r = color[1], g = color[2], b = color[3]
        return `#${r}${r}${g}${g}${b}${b}`
    }
    return color
}

const FONT_OPTIONS = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Anton', label: 'Anton' },
    { value: 'Archivo Black', label: 'Archivo Black' },
    { value: 'Quicksand', label: 'Quicksand' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Courier New', label: 'Courier New' },
]

export function TemplateEditor({ style, onChange }: TemplateEditorProps) {
    return (
        <div className="space-y-6 pb-20">
            {/* Typography Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1 text-zinc-400">
                    <Type className="w-4 h-4" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider">Typography</h4>
                </div>

                <div className="space-y-4 px-1">
                    {/* Font Family */}
                    <div className="space-y-2">
                        <Label className="text-[11px] text-zinc-500 uppercase tracking-widest">Font Family</Label>
                        <select
                            value={style.fontFamily}
                            onChange={(e) => onChange({ fontFamily: e.target.value })}
                            className="w-full h-9 px-2 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200 text-sm cursor-pointer focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        >
                            {FONT_OPTIONS.map(f => (
                                <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                                    {f.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Font Size */}
                    <div className="space-y-2">
                        <Label className="text-[11px] text-zinc-500 uppercase tracking-widest">Font Size</Label>
                        <div className="flex items-center gap-4">
                            <Slider
                                value={[style.fontSize]}
                                min={12}
                                max={64}
                                step={1}
                                onValueChange={([val]) => onChange({ fontSize: val })}
                                className="flex-1"
                            />
                            <span className="text-xs font-mono text-zinc-400 w-8">{style.fontSize}</span>
                        </div>
                    </div>

                    {/* Font Weight */}
                    <div className="space-y-2">
                        <Label className="text-[11px] text-zinc-500 uppercase tracking-widest">Font Weight</Label>
                        <div className="flex gap-1">
                            {(['normal', 'bold'] as const).map(w => (
                                <button
                                    key={w}
                                    onClick={() => onChange({ fontWeight: w })}
                                    className={`flex-1 py-1.5 text-xs rounded-md border transition-colors ${style.fontWeight === w || (style.fontWeight === '700' && w === 'bold') || (style.fontWeight === '600' && w === 'bold')
                                        ? 'bg-blue-600 border-blue-500 text-white'
                                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                                        }`}
                                >
                                    {w === 'normal' ? 'Regular' : 'Bold'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[11px] text-zinc-500 uppercase tracking-widest">Letter Spacing</Label>
                            <Slider
                                value={[style.letterSpacing]}
                                min={0}
                                max={10}
                                step={0.5}
                                onValueChange={([val]) => onChange({ letterSpacing: val })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[11px] text-zinc-500 uppercase tracking-widest">Line Height</Label>
                            <Slider
                                value={[style.lineHeight]}
                                min={0.8}
                                max={2}
                                step={0.1}
                                onValueChange={([val]) => onChange({ lineHeight: val })}
                            />
                        </div>
                    </div>

                    {/* Text Transform */}
                    <div className="space-y-2">
                        <Label className="text-[11px] text-zinc-500 uppercase tracking-widest">Text Transform</Label>
                        <div className="flex gap-1">
                            {([
                                { value: 'none', label: 'Aa' },
                                { value: 'uppercase', label: 'AA' },
                                { value: 'lowercase', label: 'aa' },
                            ] as const).map(t => (
                                <button
                                    key={t.value}
                                    onClick={() => onChange({ textTransform: t.value })}
                                    className={`flex-1 py-1.5 text-xs rounded-md border transition-colors ${(style.textTransform || 'none') === t.value
                                        ? 'bg-blue-600 border-blue-500 text-white'
                                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Colors Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1 text-zinc-400">
                    <Palette className="w-4 h-4" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider">Colors & Effects</h4>
                </div>

                <div className="space-y-4 px-1">
                    {/* Text & Background Color Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[11px] text-zinc-500 uppercase tracking-widest">Text Color</Label>
                            <input
                                type="color"
                                value={toHexColor(style.color)}
                                onChange={(e) => onChange({ color: e.target.value })}
                                className="w-full h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[11px] text-zinc-500 uppercase tracking-widest">Background</Label>
                            <input
                                type="color"
                                value={toHexColor(style.backgroundColor)}
                                onChange={(e) => onChange({
                                    backgroundColor: e.target.value,
                                    // Auto-enable opacity when user picks a color
                                    backgroundOpacity: style.backgroundOpacity === 0 ? 0.7 : style.backgroundOpacity,
                                })}
                                className="w-full h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Background Opacity */}
                    <div className="space-y-2">
                        <Label className="text-[11px] text-zinc-500 uppercase tracking-widest">Background Opacity</Label>
                        <div className="flex items-center gap-4">
                            <Slider
                                value={[style.backgroundOpacity]}
                                min={0}
                                max={1}
                                step={0.05}
                                onValueChange={([val]) => onChange({ backgroundOpacity: val })}
                                className="flex-1"
                            />
                            <span className="text-xs font-mono text-zinc-400 w-10">{Math.round(style.backgroundOpacity * 100)}%</span>
                        </div>
                    </div>

                    {/* Outline Color & Width Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[11px] text-zinc-500 uppercase tracking-widest">Outline Color</Label>
                            <input
                                type="color"
                                value={toHexColor(style.outlineColor)}
                                onChange={(e) => onChange({ outlineColor: e.target.value })}
                                className="w-full h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[11px] text-zinc-500 uppercase tracking-widest">Outline Width</Label>
                            <div className="flex items-center gap-4">
                                <Slider
                                    value={[style.outlineWidth]}
                                    min={0}
                                    max={8}
                                    step={0.5}
                                    onValueChange={([val]) => onChange({ outlineWidth: val })}
                                    className="flex-1"
                                />
                                <span className="text-xs font-mono text-zinc-400 w-6">{style.outlineWidth}</span>
                            </div>
                        </div>
                    </div>

                    {/* Highlight Color */}
                    <div className="space-y-2">
                        <Label className="text-[11px] text-zinc-500 uppercase tracking-widest">Highlight Color (Dynamic/Word)</Label>
                        <input
                            type="color"
                            value={toHexColor(style.highlightColor || '#FFD700')}
                            onChange={(e) => onChange({ highlightColor: e.target.value })}
                            className="w-full h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                        />
                    </div>
                </div>
            </section>

            {/* Positioning Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1 text-zinc-400">
                    <Move className="w-4 h-4" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider">Positioning</h4>
                </div>

                <div className="space-y-4 px-1">
                    <div className="space-y-2">
                        <Label className="text-[11px] text-zinc-500 uppercase tracking-widest">Vertical Position (%)</Label>
                        <div className="flex items-center gap-4">
                            <Slider
                                value={[style.verticalOffset]}
                                min={5}
                                max={95}
                                step={1}
                                onValueChange={([val]) => onChange({ verticalOffset: val })}
                                className="flex-1"
                            />
                            <span className="text-xs font-mono text-zinc-400 w-8">{style.verticalOffset}%</span>
                        </div>
                    </div>

                    {/* Text Alignment */}
                    <div className="space-y-2">
                        <Label className="text-[11px] text-zinc-500 uppercase tracking-widest">Text Align</Label>
                        <div className="flex gap-1">
                            {(['left', 'center', 'right'] as const).map(a => (
                                <button
                                    key={a}
                                    onClick={() => onChange({ textAlign: a })}
                                    className={`flex-1 py-1.5 text-xs rounded-md border transition-colors capitalize ${style.textAlign === a
                                        ? 'bg-blue-600 border-blue-500 text-white'
                                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                                        }`}
                                >
                                    {a}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Position */}
                    <div className="space-y-2">
                        <Label className="text-[11px] text-zinc-500 uppercase tracking-widest">Position</Label>
                        <div className="flex gap-1">
                            {(['top', 'center', 'bottom'] as const).map(p => (
                                <button
                                    key={p}
                                    onClick={() => onChange({ position: p })}
                                    className={`flex-1 py-1.5 text-xs rounded-md border transition-colors capitalize ${style.position === p
                                        ? 'bg-blue-600 border-blue-500 text-white'
                                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
