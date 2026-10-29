'use client'

import { useEffect, useState } from 'react'
import type { FormEvent, JSX } from 'react'
import { bookServices, buildDays, icsFile, slotsFor } from './data'
import type { BookDay, ServiceId, Vehicle } from './data'
import { Arrow, Plate, Tick } from './parts'
import { RegForm } from './reg'
import styles from './styles.module.css'

type Errors = Partial<Record<'car' | 'day' | 'time' | 'name' | 'mobile', string>>
type Done = { ref: string; plate: string; car: string; service: string; total: number; when: string; iso: string; time: string; drop: boolean; name: string }

export function Booking({ vehicle, onVehicle }: { vehicle: Vehicle | null; onVehicle: (v: Vehicle) => void }): JSX.Element {
  const [days, setDays] = useState<BookDay[] | null>(null)
  const [service, setService] = useState<ServiceId>('mot')
  const [wait, setWait] = useState(true)
  const [dayIso, setDayIso] = useState<string | null>(null)
  const [time, setTime] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [done, setDone] = useState<Done | null>(null)
  const [changingCar, setChangingCar] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setDays(buildDays(Date.now())), 0)
    return () => window.clearTimeout(t)
  }, [])

  const svc = bookServices.find((s) => s.id === service) ?? bookServices[0]
  const drop = svc.dropOff || !wait
  const day = days?.find((d) => d.iso === dayIso) ?? null
  const slots = day ? slotsFor(day, svc.dropOff) : []
  const slotFree = time !== null && slots.some((s) => s.time === time && s.free)
  const showReg = !vehicle || changingCar

  function pickService(id: ServiceId) {
    setService(id)
    const next = bookServices.find((s) => s.id === id)
    if (day && time && next && !slotsFor(day, next.dropOff).some((s) => s.time === time && s.free)) setTime(null)
  }

  function pickDay(iso: string) {
    setDayIso(iso)
    const d = days?.find((x) => x.iso === iso)
    if (d && time && !slotsFor(d, svc.dropOff).some((s) => s.time === time && s.free)) setTime(null)
    setErrors((e) => ({ ...e, day: undefined }))
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const next: Errors = {}
    if (!vehicle) next.car = 'Find your car by its registration first.'
    if (!day) next.day = 'Choose a day.'
    if (!slotFree) next.time = 'Choose a free time.'
    if (name.trim().length < 2) next.name = 'Please add your name.'
    if (!/^(\+447|07)\d{9}$/.test(mobile.replace(/[\s()-]/g, ''))) next.mobile = 'Enter a UK mobile so we can text you.'
    setErrors(next)
    if (Object.keys(next).length > 0 || !vehicle || !day || !time) return
    setDone({
      ref: `NG-${Math.floor(100000 + Math.random() * 900000)}`,
      plate: vehicle.plate,
      car: `${vehicle.colour} ${vehicle.make} ${vehicle.model}`,
      service: svc.label,
      total: svc.price,
      when: day.long,
      iso: day.iso,
      time,
      drop,
      name: name.trim(),
    })
  }

  function addToCalendar(d: Done) {
    const blob = new Blob([icsFile({ iso: d.iso, time: d.time, summary: `${d.service} at Northgate Motors (${d.plate})`, ref: d.ref })], {
      type: 'text/calendar;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${d.ref}.ics`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  function reset() {
    setDone(null)
    setDayIso(null)
    setTime(null)
    setErrors({})
  }

  if (done) {
    return (
      <div className={styles.jobDone} aria-live="polite">
        <div className={styles.ticket}>
          <div className={styles.ticketHead}>
            <span className={styles.remTick}>
              <Tick />
            </span>
            <div>
              <p className={styles.ticketK}>Booking confirmed</p>
              <p className={styles.ticketRef}>{done.ref}</p>
            </div>
          </div>
          <div className={styles.ticketBody}>
            <Plate text={done.plate} small />
            <p className={styles.ticketCar}>{done.car}</p>
            <dl className={styles.ticketList}>
              <div>
                <dt>Job</dt>
                <dd>{done.service}</dd>
              </div>
              <div>
                <dt>When</dt>
                <dd>
                  {done.when}, {done.time}
                </dd>
              </div>
              <div>
                <dt>Waiting?</dt>
                <dd>{done.drop ? 'Dropping off' : 'Waiting in reception'}</dd>
              </div>
              <div>
                <dt>Pay on collection</dt>
                <dd>£{done.total}</dd>
              </div>
            </dl>
            <p className={styles.mutedText}>
              Thanks, {done.name.split(' ')[0]}. We would text you when it is done, with photos of anything that needs
              your approval before we touch it.
            </p>
            <p className={styles.demoNote}>Demo only: nothing has been sent.</p>
            <div className={styles.carActions}>
              <button type="button" className={styles.btnGreen} onClick={() => addToCalendar(done)}>
                Add to calendar
              </button>
              <button type="button" className={styles.btnLine} onClick={reset}>
                Book another
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.book}>
      <div className={styles.bookMain}>
        <div className={styles.bBlock}>
          <p className={styles.bLegend}>
            <span>1</span> Your car
          </p>
          {vehicle && !changingCar && (
            <div className={styles.bCar}>
              <Plate text={vehicle.plate} small />
              <p>
                <b>
                  {vehicle.make} {vehicle.model}
                </b>{' '}
                · {vehicle.colour} · {vehicle.fuel}
              </p>
              <button type="button" className={styles.linkBtn} onClick={() => setChangingCar(true)}>
                Change
              </button>
            </div>
          )}
          {showReg && (
            <RegForm
              id="ng-book-reg"
              variant="compact"
              onFound={(v) => {
                onVehicle(v)
                setChangingCar(false)
                setErrors((e) => ({ ...e, car: undefined }))
              }}
            />
          )}
          {errors.car && <p className={styles.regErr}>{errors.car}</p>}
        </div>

        <form id="ng-book-form" onSubmit={submit} noValidate className={styles.bForm}>
          <fieldset className={styles.bBlock}>
            <legend className={styles.bLegend}>
              <span>2</span> What do you need?
            </legend>
            <div className={styles.svcOpts}>
              {bookServices.map((s) => (
                <label key={s.id} className={`${styles.svcOpt} ${service === s.id ? styles.svcOptOn : ''}`}>
                  <input type="radio" name="ng-svc" checked={service === s.id} onChange={() => pickService(s.id)} className={styles.sr} />
                  <span className={styles.svcOptName}>{s.label}</span>
                  <span className={styles.svcOptNote}>{s.note}</span>
                  <span className={styles.svcOptPrice}>
                    £{s.price}
                    {s.was ? <s>£{s.was}</s> : null}
                  </span>
                </label>
              ))}
            </div>
            {!svc.dropOff && (
              <label className={styles.check}>
                <input type="checkbox" checked={wait} onChange={(e) => setWait(e.target.checked)} />
                <span>I will wait while it is done (about an hour)</span>
              </label>
            )}
          </fieldset>

          <fieldset className={styles.bBlock}>
            <legend className={styles.bLegend}>
              <span>3</span> When?
            </legend>
            {days ? (
              <div className={styles.dayRow}>
                {days.map((d) => (
                  <label key={d.iso} className={`${styles.dayChip} ${dayIso === d.iso ? styles.dayChipOn : ''}`}>
                    <input
                      type="radio"
                      name="ng-day"
                      checked={dayIso === d.iso}
                      onChange={() => pickDay(d.iso)}
                      className={styles.sr}
                      aria-label={d.long}
                    />
                    <span className={styles.dayDow}>{d.dow}</span>
                    <span className={styles.dayNum}>{d.date}</span>
                    <span className={styles.dayMon}>{d.mon}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className={styles.mutedText}>Loading the diary…</p>
            )}
            {errors.day && <p className={styles.regErr}>{errors.day}</p>}
            {day && (
              <div className={styles.timeGrid} key={day.iso + svc.dropOff}>
                {slots.map((s) => (
                  <label
                    key={s.time}
                    className={`${styles.timeChip} ${time === s.time ? styles.timeChipOn : ''} ${s.free ? '' : styles.timeChipOff}`}
                  >
                    <input
                      type="radio"
                      name="ng-time"
                      checked={time === s.time}
                      disabled={!s.free}
                      onChange={() => {
                        setTime(s.time)
                        setErrors((e) => ({ ...e, time: undefined }))
                      }}
                      className={styles.sr}
                      aria-label={`${s.time}${s.free ? '' : ', taken'}`}
                    />
                    {s.time}
                  </label>
                ))}
              </div>
            )}
            {day && svc.dropOff && <p className={styles.mutedSmall}>With a service, drop-off times are 8 to 10am.</p>}
            {errors.time && <p className={styles.regErr}>{errors.time}</p>}
          </fieldset>

          <fieldset className={styles.bBlock}>
            <legend className={styles.bLegend}>
              <span>4</span> Your details
            </legend>
            <div className={styles.remFields}>
              <div className={styles.field}>
                <label htmlFor="ng-name" className={styles.fieldLabel}>
                  Name
                </label>
                <input
                  id="ng-name"
                  className={styles.input}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? 'ng-name-err' : undefined}
                />
                {errors.name && <p id="ng-name-err" className={styles.regErr}>{errors.name}</p>}
              </div>
              <div className={styles.field}>
                <label htmlFor="ng-mob" className={styles.fieldLabel}>
                  Mobile
                </label>
                <input
                  id="ng-mob"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  className={styles.input}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  aria-invalid={errors.mobile ? true : undefined}
                  aria-describedby={errors.mobile ? 'ng-mob-err' : undefined}
                />
                {errors.mobile && <p id="ng-mob-err" className={styles.regErr}>{errors.mobile}</p>}
              </div>
            </div>
          </fieldset>
        </form>
      </div>

      <div className={styles.ticket}>
        <div className={styles.ticketHead}>
          <div>
            <p className={styles.ticketK}>Job card</p>
            <p className={styles.ticketRef}>Draft</p>
          </div>
        </div>
        <div className={styles.ticketBody}>
          <dl className={styles.ticketList}>
            <div>
              <dt>Car</dt>
              <dd>{vehicle ? vehicle.plate : '—'}</dd>
            </div>
            <div>
              <dt>Job</dt>
              <dd>{svc.label}</dd>
            </div>
            <div>
              <dt>When</dt>
              <dd>{day ? `${day.long}${time ? `, ${time}` : ''}` : '—'}</dd>
            </div>
            <div>
              <dt>Waiting?</dt>
              <dd>{drop ? 'Drop off' : 'Wait'}</dd>
            </div>
          </dl>
          <p className={styles.ticketTotal}>
            <span>Total, pay on collection</span>
            <b>£{svc.price}</b>
          </p>
          <button type="submit" form="ng-book-form" className={`${styles.btnGreen} ${styles.full}`}>
            Confirm booking <Arrow />
          </button>
          <p className={styles.mutedSmall}>Free retest within 10 working days if it fails and we fix it.</p>
        </div>
      </div>
    </div>
  )
}
