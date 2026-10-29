/** The stages a project moves through. The Sheet's Stage column uses these names. */
export const STAGES = [
  { name: 'Request received', blurb: 'I have your request and everything you sent.', progress: 5 },
  { name: 'Processing', blurb: 'Reading everything and planning your build.', progress: 15 },
  { name: 'Building', blurb: 'Your website is being built.', progress: 45 },
  { name: 'Preview ready', blurb: 'Have a look and tell me what you would like changed.', progress: 75 },
  { name: 'Changes', blurb: 'Working through your changes.', progress: 90 },
  { name: 'Live', blurb: 'Your website is live.', progress: 100 },
] as const

export function stageIndex(v: unknown): number {
  const s = String(v ?? '').trim().toLowerCase()
  if (/^\d+$/.test(s)) return Math.min(STAGES.length - 1, Number(s))
  const i = STAGES.findIndex((x) => x.name.toLowerCase() === s)
  return i < 0 ? 0 : i
}
