'use client'

import { useCountdown } from '@/lib/useCountdown'

export function Countdown({ target }: { target: Date | number }) {
  const [days, hours, minutes, seconds] = useCountdown(target)

  if (new Date(target).getTime() < Date.now()) {
    return <span className="tabular-nums">00:00:00</span>
  }

  return (
    <span className="tabular-nums">
      {days ? `${days}:` : null}
      {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </span>
  )
}
