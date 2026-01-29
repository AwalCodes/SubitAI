/**
 * SubitAI Subtitle Style Library
 * This file contains the default presets for the subtitle engine.
 */

export interface SubtitlePreset {
    id: string;
    name: string;
    category: 'BASIC' | 'DYNAMIC' | 'WORD';
    style: {
        fontFamily: string;
        fontSize: number; // Base size, will be scaled
        fontWeight: 'normal' | 'bold' | '600' | '700';
        color: string;
        backgroundColor: string;
        backgroundOpacity: number;
        textAlign: 'left' | 'center' | 'right';
        position: 'bottom' | 'center' | 'top';
        verticalOffset: number; // % from edge
        outlineColor: string;
        outlineWidth: number;
        borderRadius: number;
        padding: number;
        letterSpacing: number;
        lineHeight: number;
        textShadow?: string;
        animationIn?: string;
        // For DYNAMIC/WORD styles
        highlightColor?: string;
        highlightScale?: number;
    };
}

export const STYLE_PRESETS: SubtitlePreset[] = [
    {
        id: 'classic-dark',
        name: 'Classic Dark',
        category: 'BASIC',
        style: {
            fontFamily: 'Inter',
            fontSize: 24,
            fontWeight: 'bold',
            color: '#FFFFFF',
            backgroundColor: '#000000',
            backgroundOpacity: 0.7,
            textAlign: 'center',
            position: 'bottom',
            verticalOffset: 15,
            outlineColor: '#000000',
            outlineWidth: 0,
            borderRadius: 8,
            padding: 12,
            letterSpacing: 0,
            lineHeight: 1.4,
        },
    },
    {
        id: 'modern-bold',
        name: 'Modern Bold',
        category: 'BASIC',
        style: {
            fontFamily: 'Archivo Black',
            fontSize: 28,
            fontWeight: 'bold',
            color: '#FFFFFF',
            backgroundColor: 'transparent',
            backgroundOpacity: 0,
            textAlign: 'center',
            position: 'bottom',
            verticalOffset: 20,
            outlineColor: '#000000',
            outlineWidth: 4,
            borderRadius: 0,
            padding: 0,
            letterSpacing: 1,
            lineHeight: 1.2,
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        },
    },
    {
        id: 'dynamic-karaoke',
        name: 'Dynamic Karaoke',
        category: 'DYNAMIC',
        style: {
            fontFamily: 'Inter',
            fontSize: 26,
            fontWeight: '700',
            color: '#A0A0A0', // Muted base color
            highlightColor: '#FFD700', // Yellow highlight
            backgroundColor: 'rgba(0,0,0,0.5)',
            backgroundOpacity: 0.5,
            textAlign: 'center',
            position: 'bottom',
            verticalOffset: 15,
            outlineColor: '#000000',
            outlineWidth: 2,
            borderRadius: 12,
            padding: 16,
            letterSpacing: 0,
            lineHeight: 1.4,
            animationIn: 'fade',
        },
    },
    {
        id: 'hormozi-word',
        name: 'Hormozi Pop',
        category: 'WORD',
        style: {
            fontFamily: 'Anton',
            fontSize: 32,
            fontWeight: 'bold',
            color: '#FFFFFF',
            highlightColor: '#00FF00', // Green for emphasis
            highlightScale: 1.2,
            backgroundColor: 'transparent',
            backgroundOpacity: 0,
            textAlign: 'center',
            position: 'center',
            verticalOffset: 50,
            outlineColor: '#000000',
            outlineWidth: 6,
            borderRadius: 0,
            padding: 0,
            letterSpacing: 2,
            lineHeight: 1,
            animationIn: 'pop',
        },
    }
];

export const SAFE_ZONE_PADDING = 0.1; // 10% from edges
