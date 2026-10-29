import type { Metadata } from 'next'
import { StartFlow } from '@/components/start-flow'

export const metadata: Metadata = {
  title: 'Start a project',
  description: 'Tell me what you need and I will build it for free. No deposit, and no obligation to buy.',
}

export default function StartPage() {
  return <StartFlow />
}
