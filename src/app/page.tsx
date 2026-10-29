import { BookingFlow } from '@/components/booking-flow'
import { refreshVisitor } from '@/lib/booking/actions'
import { nextWeekdays } from '@/lib/booking/dates'
import { DAYS_SHOWN } from '@/lib/booking/options'

// Reads the visitor's cookie, so this page is rendered per request, never cached.
export default async function Home() {
  const { taken, mine } = await refreshVisitor()
  return <BookingFlow days={nextWeekdays(DAYS_SHOWN)} initialTaken={taken} initialMine={mine} />
}
