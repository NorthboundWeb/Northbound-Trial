import type { Metadata } from 'next'
import { DiaryBoard } from '@/components/diary-board'
import { DiaryLogin } from '@/components/diary-login'
import { TopBar } from '@/components/top-bar'
import { diaryLogout, getDiary } from '@/lib/booking/actions'
import { nextWeekdays } from '@/lib/booking/dates'
import { DAYS_SHOWN } from '@/lib/booking/options'

export const metadata: Metadata = { title: 'Diary' }

export default async function DiaryPage() {
  const data = await getDiary()

  return (
    <>
      <TopBar count="Diary" />
      <main id="main" className={`stage${data ? ' wide' : ''}`}>
        {data ? (
          <>
            <DiaryBoard days={nextWeekdays(DAYS_SHOWN)} initial={data} />
            <form action={diaryLogout} style={{ marginTop: 40 }}>
              <button className="link" type="submit">
                Sign out of the diary
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="display">Owner sign-in</h1>
            <p className="sub">The diary lists every call request. Enter the diary password to open it.</p>
            <DiaryLogin />
          </>
        )}
      </main>
    </>
  )
}
