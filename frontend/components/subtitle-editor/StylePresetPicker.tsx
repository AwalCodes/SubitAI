'use client'

import { useState } from 'react'
import { STYLE_PRESETS, SubtitlePreset, getPresetsByCategory } from '@/lib/styles.config'
import { Check, Sparkles, Type, Zap, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StylePresetPickerProps {
    currentPresetId: string;
    onSelect: (preset: SubtitlePreset) => void;
}

type CategoryTab = 'BASIC' | 'DYNAMIC' | 'WORD';

const CATEGORY_INFO: Record<CategoryTab, { label: string; icon: React.ReactNode; description: string }> = {
    BASIC: {
        label: 'Basic',
        icon: <Type className="w-4 h-4" />,
        description: 'Classic subtitle styles'
    },
    DYNAMIC: {
        label: 'Dynamic',
        icon: <Zap className="w-4 h-4" />,
        description: 'Word highlighting'
    },
    WORD: {
        label: 'Word',
        icon: <MessageSquare className="w-4 h-4" />,
        description: 'Single word display'
    },
};

export function StylePresetPicker({ currentPresetId, onSelect }: StylePresetPickerProps) {
    const [activeCategory, setActiveCategory] = useState<CategoryTab>('BASIC');

    const presets = getPresetsByCategory(activeCategory);

    // Find which category the current preset belongs to and switch to it
    const currentPreset = STYLE_PRESETS.find(p => p.id === currentPresetId);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2 px-1">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <h3 className="text-sm font-semibold text-zinc-200">Style Presets</h3>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-1 p-1 bg-zinc-900/80 rounded-xl">
                {(['BASIC', 'DYNAMIC', 'WORD'] as CategoryTab[]).map((category) => {
                    const info = CATEGORY_INFO[category];
                    const isActive = activeCategory === category;
                    const hasSelectedPreset = currentPreset?.category === category;

                    return (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-medium transition-all duration-200",
                                isActive
                                    ? "bg-zinc-700 text-white shadow-sm"
                                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50",
                                hasSelectedPreset && !isActive && "text-blue-400"
                            )}
                        >
                            {info.icon}
                            <span>{info.label}</span>
                            {hasSelectedPreset && !isActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Category Description */}
            <p className="text-xs text-zinc-500 px-1">
                {CATEGORY_INFO[activeCategory].description}
            </p>

            {/* Style Grid */}
            <div className="grid grid-cols-2 gap-3 pb-4 max-h-[320px] overflow-y-auto pr-1">
                {presets.map((preset) => {
                    const isSelected = currentPresetId === preset.id;
                    const previewBg = preset.style.backgroundColor === 'transparent'
                        ? '#1f1f23'
                        : preset.style.backgroundColor;

                    return (
                        <button
                            key={preset.id}
                            onClick={() => onSelect(preset)}
                            className={cn(
                                "relative flex flex-col items-start gap-2 p-3 rounded-xl border transition-all duration-200",
                                "hover:border-zinc-500 hover:bg-zinc-800/50 hover:scale-[1.02]",
                                isSelected
                                    ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500"
                                    : "border-zinc-800 bg-zinc-900/50"
                            )}
                        >
                            {/* Preview Box */}
                            <div
                                className="w-full h-12 rounded-lg mb-1 flex items-center justify-center overflow-hidden border border-zinc-700/50 relative"
                                style={{
                                    backgroundColor: previewBg,
                                }}
                            >
                                {/* For DYNAMIC styles, show word highlighting preview */}
                                {preset.category === 'DYNAMIC' ? (
                                    <span style={{
                                        fontFamily: preset.style.fontFamily,
                                        fontWeight: preset.style.fontWeight,
                                        fontSize: '12px',
                                        letterSpacing: preset.style.letterSpacing,
                                    }}>
                                        <span style={{ color: preset.style.color }}>The </span>
                                        <span style={{
                                            color: preset.style.highlightColor,
                                            backgroundColor: preset.style.highlightBackground,
                                            padding: preset.style.highlightBackground ? '2px 4px' : 0,
                                            borderRadius: preset.style.highlightBackground ? '4px' : 0,
                                        }}>quick</span>
                                        <span style={{ color: preset.style.color }}> fox</span>
                                    </span>
                                ) : preset.category === 'WORD' ? (
                                    // For WORD styles, show single word
                                    <span style={{
                                        fontFamily: preset.style.fontFamily,
                                        fontWeight: preset.style.fontWeight,
                                        fontSize: '16px',
                                        color: preset.style.color === 'transparent' ? 'transparent' : preset.style.color,
                                        letterSpacing: preset.style.letterSpacing,
                                        WebkitTextStroke: preset.style.outlineWidth > 0
                                            ? `${Math.min(preset.style.outlineWidth / 2, 2)}px ${preset.style.outlineColor}`
                                            : undefined,
                                        textShadow: preset.style.textShadow,
                                    }}>
                                        THE
                                    </span>
                                ) : (
                                    // For BASIC styles, show regular text
                                    <span style={{
                                        fontFamily: preset.style.fontFamily,
                                        fontWeight: preset.style.fontWeight,
                                        fontSize: '12px',
                                        color: preset.style.color,
                                        letterSpacing: preset.style.letterSpacing,
                                        textShadow: preset.style.textShadow,
                                        WebkitTextStroke: preset.style.outlineWidth > 0
                                            ? `${Math.min(preset.style.outlineWidth / 2, 1)}px ${preset.style.outlineColor}`
                                            : undefined,
                                    }}>
                                        {preset.name}
                                    </span>
                                )}
                            </div>

                            {/* Preset Name */}
                            <div className="flex flex-col items-start gap-0.5">
                                <span className="text-xs font-medium text-zinc-100">{preset.name}</span>
                                {preset.style.displayMode && preset.style.displayMode !== 'line-by-line' && (
                                    <span className="text-[10px] text-zinc-500">
                                        {preset.style.displayMode === 'word-highlight' ? 'Word highlight' : 'Word by word'}
                                    </span>
                                )}
                            </div>

                            {/* Selected Check */}
                            {isSelected && (
                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    )
}
