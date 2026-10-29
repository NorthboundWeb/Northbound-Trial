import type { ComponentType } from 'react'
import * as Heating from './heating'
import * as Electrician from './electrician'
import * as Garage from './garage'
import * as Bakery from './bakery'
import * as Florist from './florist'
import * as Photographer from './photographer'
import * as Lashes from './lashes'
import * as Barber from './barber'
import * as Tattoo from './tattoo'
import * as Grooming from './grooming'
import * as Windows from './windows'
import * as PersonalTrainer from './personal-trainer'

/**
 * The real demo websites, by slug. Each folder in this directory exports a
 * full interactive `Site` and a static first-screen `Shot` (see DEMOS.md).
 * Demos not listed here fall back to the simple drawn version.
 */
export const demoComponents: Record<string, { Site: ComponentType; Shot: ComponentType } | undefined> = {
  'heating': { Site: Heating.Site, Shot: Heating.Shot },
  'electrician': { Site: Electrician.Site, Shot: Electrician.Shot },
  'garage': { Site: Garage.Site, Shot: Garage.Shot },
  'bakery': { Site: Bakery.Site, Shot: Bakery.Shot },
  'florist': { Site: Florist.Site, Shot: Florist.Shot },
  'photographer': { Site: Photographer.Site, Shot: Photographer.Shot },
  'lashes': { Site: Lashes.Site, Shot: Lashes.Shot },
  'barber': { Site: Barber.Site, Shot: Barber.Shot },
  'tattoo': { Site: Tattoo.Site, Shot: Tattoo.Shot },
  'grooming': { Site: Grooming.Site, Shot: Grooming.Shot },
  'windows': { Site: Windows.Site, Shot: Windows.Shot },
  'personal-trainer': { Site: PersonalTrainer.Site, Shot: PersonalTrainer.Shot },
}
