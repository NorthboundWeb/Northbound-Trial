import type { Metadata } from 'next'
import { ProjectFlow } from '@/components/project-flow'

export const metadata: Metadata = { title: 'Start a project' }

export default function StartPage() {
  return <ProjectFlow />
}
