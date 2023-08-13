'use client'

import { formatEther } from 'viem'
import { POWERBALD_ABI } from '@/lib/abi'
import { CONTRACT_ADDRESS } from '@/lib/consts'
import { Countdown } from '@/components/Countdown'
import { useBalance, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi'

export function RoundCountdown() {
  const { data: currentRound } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: POWERBALD_ABI,
    functionName: 'games_count',
  })
  const { data: duration } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: POWERBALD_ABI,
    functionName: 'game_duration',
  })
  const { data: start } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: POWERBALD_ABI,
    functionName: 'game_finalised',
    args: [(currentRound ?? 1n) - 1n],
    enabled: currentRound !== undefined,
  })

  const { data: balance } = useBalance({
    address: CONTRACT_ADDRESS,
  })

  console.log({ currentRound, prevRound: (currentRound ?? 1n) - 1n, duration, start })

  const currentTimeStamp = BigInt(Date.now())
  const endTimeStamp = !!start && !!duration ? (start + duration) * 1000n : undefined

  const isOver = !!endTimeStamp && currentTimeStamp > endTimeStamp!

  const { config } = usePrepareContractWrite({
    abi: POWERBALD_ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'draw',
    enabled: isOver,
    value: 0n,
  })

  const { write: draw } = useContractWrite(config)

  return (
    <div className="text-center grid gap-2 grid-cols-2">
      <div className="flex flex-col">
        <div className="font-semibold rounded-md border">Next Drawing</div>
        <div className="text-3xl font-semibold m-auto py-4">
          {isOver ? (
            <>
              <button className="px-2 py-1 bg-green-600 w-full rounded-lg text-lg" disabled={!draw} onClick={draw}>
                DRAW
              </button>
            </>
          ) : endTimeStamp ? (
            <Countdown target={new Date(parseInt(endTimeStamp.toString()))} />
          ) : (
            'Soon'
          )}
        </div>
      </div>
      <div className="flex flex-col">
        <div className="font-semibold rounded-md border">Estimated Jackpot</div>
        <div className="m-auto py-4">
          <div className="">
            <span className="text-4xl font-black animate-text bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
              {balance?.value ? parseFloat(formatEther(balance.value)).toFixed(2) : 0}
            </span>{' '}
            <span className="self-end text-sm font-semibold">ETH</span>
          </div>
        </div>
      </div>
    </div>
  )
}
