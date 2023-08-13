'use client'

import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { POWERBALD_ABI } from '@/lib/abi'
import { useWindowSize } from 'react-use'
import { useForm } from 'react-hook-form'
import ReactConfetti from 'react-confetti'
import ConnectWallet from './ConnectWallet'
import { Address, bytesToHex, fromHex } from 'viem'
import { HTMLProps, ReactNode, useState } from 'react'
import { CONTRACT_ADDRESS, MAX_NUMBER, PICK_COUNT } from '@/lib/consts'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/Accordion'
import {
  useAccount,
  useContractRead,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi'

function Button({
  isActive,
  onClick,
  value,
  children,
  ...rest
}: Omit<HTMLProps<HTMLButtonElement>, 'onClick'> & {
  value: number | undefined
  isActive: boolean
  children: ReactNode
  onClick: (pick: number | undefined) => void
}) {
  return (
    <button
      {...rest}
      type="button"
      className={cn(
        `flex items-center leading-none justify-center text-sm border-2 aspect-square rounded-sm font-semibold border-red-500 text-gray-200 transition-all duration-100 disabled:opacity-50`,
        isActive && 'bg-red-500 text-white'
      )}
      onClick={() => onClick(value)}
    >
      {children}
    </button>
  )
}

function NewTicket() {
  const [isQuickPick, setIsQuickPick] = useState(false)

  const { data: currentRound } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: POWERBALD_ABI,
    functionName: 'games_count',
  })

  const { userTickets: tickets, refetch } = useTickets(currentRound)

  const form = useForm({
    defaultValues: {
      picks: new Set<number>(),
    },
  })

  const picks = form.watch('picks')
  const bytesPicks = new Uint8Array(picks)

  const { data: price } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: POWERBALD_ABI,
    functionName: 'entry_price',
  })

  const { config } = usePrepareContractWrite({
    abi: POWERBALD_ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'enter',
    value: price as bigint,
    args: [bytesToHex(bytesPicks)],
    enabled: price !== undefined && picks.size === PICK_COUNT,
  })

  const { writeAsync: enter, data } = useContractWrite(config)

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      toast.success('Ticket purchased 🎉', { position: 'bottom-center' })
      refetch()
    },
  })

  const alreadyPicked =
    !!tickets?.length &&
    picks.size === PICK_COUNT &&
    tickets.some(ticket => {
      return Array.from(picks).every(pick => ticket.includes(pick))
    })

  async function onSubmit() {
    if (!enter) return
    await enter()

    form.reset()
    toast.success('Ticket purchased!', { position: 'bottom-center' })
    setIsQuickPick(false)
  }

  const togglePick = (pick: number | undefined) => {
    if (pick === undefined) return

    setIsQuickPick(false)
    let newPicks = new Set(picks)
    if (newPicks.has(pick)) {
      newPicks.delete(pick)
    } else if (newPicks.size !== PICK_COUNT) {
      newPicks.add(pick)
    }
    newPicks = new Set(Array.from(newPicks).sort())
    form.setValue('picks', newPicks)
  }

  const quickPick = () => {
    form.setValue('picks', getRandomPick())
    setIsQuickPick(true)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <fieldset disabled={isLoading || form.formState.isSubmitting} className="space-y-4">
        <div className="grid grid-cols-10 gap-2 rounded-lg">
          <div className="col-span-4 text-center self-center font-bold">PICK {PICK_COUNT} or QP</div>
          {Array.from({ length: MAX_NUMBER }).map((_, i) => (
            <Button
              key={i}
              value={i}
              isActive={picks.has(i)}
              onClick={togglePick}
              disabled={!picks.has(i) && picks.size === PICK_COUNT}
            >
              {i + 1}
            </Button>
          ))}
          <div />
          <div />
          <Button onClick={() => quickPick()} isActive={isQuickPick} value={undefined}>
            {isQuickPick ? <span className="text-2xl leading-none">×</span> : null}
          </Button>
          <div className="col-span-3 self-center text-center font-bold">QUICK PICK</div>
        </div>
        {alreadyPicked && (
          <div className="border-2 rounded-md border-red-500 p-2">
            Warning: You already have a ticket with those numbers!
          </div>
        )}
        <button
          type="submit"
          disabled={!enter || picks.size !== PICK_COUNT}
          className="bg-red-500 text-white font-bold w-full block text-center rounded-lg p-2 disabled:opacity-50"
        >
          {isLoading ? 'Buying…' : form.formState.isSubmitting ? 'Loading…' : 'Buy Ticket'}
        </button>
      </fieldset>
    </form>
  )
}

function useTickets(round: bigint | undefined, winningNumbers?: number[]) {
  const { address } = useAccount()

  const { data: entriesCount, refetch: refetchEntriesCount } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: POWERBALD_ABI,
    functionName: 'entries_count',
    args: [round!],
    enabled: !!round,
  })

  const contracts = Array.from({ length: Number(entriesCount) }).map((_, i) => ({
    address: CONTRACT_ADDRESS,
    abi: POWERBALD_ABI,
    functionName: 'entries',
    args: [round!, i],
  }))

  const { data: entriesRaw, refetch: refetchEntries } = useContractReads({
    contracts,
    enabled: round !== undefined && !!entriesCount,
  })

  const entries: { participant: Address; picks: Address }[] | undefined = entriesRaw?.map(entry => entry.result as any)

  const allTickets = entries?.map(entry => Array.from(fromHex(entry.picks, 'bytes')))

  const userTickets = entries
    ?.filter(entry => entry.participant === address)
    .map(entry => Array.from(fromHex(entry.picks, 'bytes')))

  const winnerIndex = allTickets?.findIndex(ticket => {
    return ticket.every(pick => winningNumbers?.includes(pick))
  })

  return {
    allTickets,
    userTickets,
    winnerIndex: winnerIndex === undefined || winnerIndex === -1 ? undefined : winnerIndex,
    async refetch() {
      await refetchEntriesCount()
      await refetchEntries()
    },
  }
}

function ClaimButton({ round, index }: { round: bigint; index: number }) {
  const { config } = usePrepareContractWrite({
    abi: POWERBALD_ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'claim',
    args: [round, BigInt(index)],
  })

  const { writeAsync: claim, data, isLoading: isWriting } = useContractWrite(config)
  const { isLoading } = useWaitForTransaction({ hash: data?.hash, onSuccess: () => toast.success('Prize claimed!') })
  return (
    <button
      disabled={!claim || isWriting || isLoading}
      onClick={claim}
      className="p-4 bg-green-600 w-full rounded-lg text-4xl font-black"
    >
      {isWriting || isLoading ? 'Claiming…' : 'Claim Prize'}
    </button>
  )
}

function Winners({ round }: { round: bigint }) {
  const { width, height } = useWindowSize()

  const { data: winnerData } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: POWERBALD_ABI,
    functionName: 'compute_winning_balls',
    args: [round],
  })

  const winningNumbers = winnerData ? Array.from(fromHex(winnerData, 'bytes')).sort() : undefined

  const { userTickets: tickets, winnerIndex } = useTickets(round, winningNumbers)

  winnerIndex !== undefined && console.log('Winner:', tickets?.[winnerIndex])

  return (
    <div className="border rounded-sm p-4 space-y-4">
      <div className="py-4 text-center text-2xl font-bold">And the winner is…</div>
      <div className="flex gap-2 justify-center items-center">
        {winningNumbers
          ? winningNumbers.map((number, i) => (
              <div
                key={i}
                className="aspect-square rounded-full border-2 text-4xl font-bold w-16 flex items-center justify-center animate-in fade-in-100"
              >
                {number + 1}
              </div>
            ))
          : Array.from({ length: PICK_COUNT }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-full border-2 text-4xl font-bold w-16 flex items-center justify-center animate-pulse bg-gray-200"
              ></div>
            ))}
      </div>
      {!!tickets?.length && (
        <>
          <div className="py-2 border-b font-semibold">Your picks</div>
          <ul className="space-y-4">
            {tickets.map((ticket, i) => (
              <li key={i} className="flex justify-center gap-2 items-center">
                <span className="font-black text-2xl mr-4">{i + 1}.</span>
                {ticket.map((number, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-full border font-bold w-12 flex items-center justify-center"
                  >
                    {number + 1}
                  </div>
                ))}
              </li>
            ))}
          </ul>
          {winnerIndex !== undefined && winnerIndex > -1 && (
            <div className="text-center ">
              <div className="space-y-4">
                <span className="text-4xl font-black animate-text bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
                  YOU WON!!!
                </span>

                <ClaimButton round={round} index={winnerIndex} />
              </div>

              <ReactConfetti className="fixed inset-0 z-30" width={width} height={height} numberOfPieces={200} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function Picker() {
  const { isConnected, isConnecting } = useAccount()

  const { data: currentRoundRaw } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: POWERBALD_ABI,
    functionName: 'games_count',
  })

  const currentRound = currentRoundRaw ?? 1n
  const prevRound = currentRound - 1n

  const { userTickets: tickets } = useTickets(currentRound)

  if (isConnecting) {
    return (
      <div className="border rounded-sm p-4 space-y-4">
        <div className="py-4 text-center text-2xl font-bold">Loading…</div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="border rounded-sm p-4 space-y-4">
        <div className="text-center">Connect your wallet to buy a ticket</div>
        <div className="flex justify-center">
          <ConnectWallet />
        </div>
      </div>
    )
  }

  return (
    <Accordion type="multiple" className="w-full" defaultValue={['buy', 'tickets']}>
      <AccordionItem value="buy">
        <AccordionTrigger>Buy a ticket</AccordionTrigger>
        <AccordionContent>
          <NewTicket />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="tickets">
        <AccordionTrigger>Your tickets</AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-4">
            {!tickets?.length
              ? 'No tickets yet…'
              : tickets.map((ticket, i) => (
                  <li key={i} className="flex justify-center gap-2 items-center">
                    <span className="font-black text-2xl mr-4">{i + 1}.</span>
                    {ticket.map((number, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-full border font-bold w-12 flex items-center justify-center"
                      >
                        {number + 1}
                      </div>
                    ))}
                  </li>
                ))}
          </ul>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="results">
        <AccordionTrigger>Results of round {prevRound.toString()}</AccordionTrigger>
        <AccordionContent>
          <Winners round={prevRound} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

function getRandomInt(min: number, max: number) {
  // Create byte array and fill with 1 random number
  const byteArray = new Uint8Array(1)
  window.crypto.getRandomValues(byteArray)

  const range = max - min + 1
  const max_range = 256
  if (byteArray[0] >= Math.floor(max_range / range) * range) return getRandomInt(min, max)
  return min + (byteArray[0] % range)
}

function getRandomPick() {
  const picks = new Set<number>()
  while (picks.size < PICK_COUNT) {
    picks.add(getRandomInt(0, MAX_NUMBER - 1))
  }
  return new Set(Array.from(picks).sort())
}
