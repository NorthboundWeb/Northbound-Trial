import type { ComponentType } from 'react'

/**
 * The real demo websites, by slug. Each folder in this directory exports a
 * full interactive `Site` and a static first-screen `Shot` (see DEMOS.md).
 * Demos not listed here fall back to the simple drawn version.
 */
export const demoComponents: Record<string, { Site: ComponentType; Shot: ComponentType } | undefined> = {}
