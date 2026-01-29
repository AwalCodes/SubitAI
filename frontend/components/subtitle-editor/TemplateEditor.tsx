'use client'

import { SubtitleStyle } from './SubtitleEditor'
import { Settings2, Type, Palette, Move, Sparkles } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

interface TemplateEditorProps {
    style: SubtitleStyle;
    onChange: (newStyle: Partial<SubtitleStyle>) => void;
}

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
                </div>
            </section>

            {/* Colors Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 px-1 text-zinc-400">
                    <Palette className="w-4 h-4" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider">Colors & Effects</h4>
                </div>

                <div className="grid grid-cols-2 gap-4 px-1">
                    <div className="space-y-2">
                        <Label className="text-[11px] text-zinc-500 uppercase tracking-widest">Text Color</Label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={style.color}
                                onChange={(e) => onChange({ color: e.target.value })}
                                className="w-full h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[11px] text-zinc-500 uppercase tracking-widest">Background</Label>
                        <input
                            type="color"
                            value={style.backgroundColor}
                            onChange={(e) => onChange({ backgroundColor: e.target.value })}
                            className="w-full h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                        />
                    </div>
                </div>

                <div className="space-y-2 px-1">
                    <Label className="text-[11px] text-zinc-500 uppercase tracking-widest">Highlight Color (Karaoke/Word)</Label>
                    <input
                        type="color"
                        value={style.highlightColor || '#FFD700'}
                        onChange={(e) => onChange({ highlightColor: e.target.value })}
                        className="w-full h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                    />
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
                </div>
            </section>
        </div>
    )
}
