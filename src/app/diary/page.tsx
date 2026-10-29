import type { Metadata } from 'next'
import { DiaryBoard } from '@/components/diary-board'
import { DiaryLogin } from '@/components/diary-login'
import { diaryLogout, getDiary } from '@/lib/booking/actions'
import { nextWeekdays } from '@/lib/booking/dates'
import { DAYS_SHOWN } from '@/lib/booking/options'

export const metadata: Metadata = { title: 'Diary' }

export default async function DiaryPage() {
  const data = await getDiary()

  if (!data) {
    return (
      <div style={{ maxWidth: 44 * 16 }}>
        <p className="label kick">Diary</p>
        <h1 className="display" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', marginTop: 18 }}>
          Owner sign-in<span className="kick">.</span>
        </h1>
        <p className="sub">The diary lists every call request. Enter the diary password to open it.</p>
        <DiaryLogin />
      </div>
    )
  }

  return (
    <>
      <DiaryBoard days={nextWeekdays(DAYS_SHOWN)} initial={data} />
      <form action={diaryLogout} style={{ marginTop: 40 }}>
        <button className="link" type="submit">
          Sign out of the diary
        </button>
      </form>
    </>
  )
}
