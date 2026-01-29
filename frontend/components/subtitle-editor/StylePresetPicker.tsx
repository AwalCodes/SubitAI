'use client'

import { STYLE_PRESETS, SubtitlePreset } from '@/lib/styles.config'
import { Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StylePresetPickerProps {
    currentPresetId: string;
    onSelect: (preset: SubtitlePreset) => void;
}

export function StylePresetPicker({ currentPresetId, onSelect }: StylePresetPickerProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <h3 className="text-sm font-semibold text-zinc-200">Style Presets</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-4">
                {STYLE_PRESETS.map((preset) => (
                    <button
                        key={preset.id}
                        onClick={() => onSelect(preset)}
                        className={cn(
                            "relative flex flex-col items-start gap-2 p-3 rounded-xl border transition-all duration-200",
                            "hover:border-zinc-500 hover:bg-zinc-800/50",
                            currentPresetId === preset.id
                                ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500"
                                : "border-zinc-800 bg-zinc-900/50"
                        )}
                    >
                        <div
                            className="w-full h-12 rounded-lg mb-1 flex items-center justify-center overflow-hidden border border-zinc-700/50"
                            style={{
                                fontFamily: preset.style.fontFamily,
                                backgroundColor: preset.style.backgroundColor,
                                color: preset.style.color,
                                fontWeight: preset.style.fontWeight,
                            }}
                        >
                            <span style={{ fontSize: '14px' }}>Aa</span>
                        </div>

                        <div className="flex flex-col items-start gap-0.5">
                            <span className="text-xs font-medium text-zinc-100">{preset.name}</span>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{preset.category}</span>
                        </div>

                        {currentPresetId === preset.id && (
                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}
