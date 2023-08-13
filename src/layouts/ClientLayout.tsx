'use client'

import { cn } from '@/lib/utils'
import { arbitrum } from 'viem/chains'
import { APP_NAME } from '@/lib/consts'
import { IconContext } from '@phosphor-icons/react'
import { publicProvider } from 'wagmi/providers/public'
import { FC, PropsWithChildren, ReactNode } from 'react'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'
import { WagmiConfig, configureChains, createConfig } from 'wagmi'

const { chains, publicClient } = configureChains(
  [arbitrum],
  [
    jsonRpcProvider({
      rpc: chain => {
        if (chain.id === arbitrum.id) {
          return {
            http: `https://rpc.eu-central-2.gateway.fm/v4/arbitrum/non-archival/arb1?apiKey=F9nv9Ekbj_fHjpWPY2lTcEzVYq0pXS96._8d_8uZMRxLne0sI`,
            webSocket: `wss://rpc.eu-central-2.gateway.fm/ws/v4/arbitrum/non-archival/arb1?apiKey=F9nv9Ekbj_fHjpWPY2lTcEzVYq0pXS96._8d_8uZMRxLne0sI`,
          }
        }

        return null
      },
    }),
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID! }),
    publicProvider(),
  ]
)

const config = createConfig(
  getDefaultConfig({
    chains,
    publicClient,
    appName: APP_NAME,
    infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
    walletConnectProjectId: process.env.NEXT_PUBLIC_WC_ID!,
  })
)

export const ClientLayout: FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <IconContext.Provider value={{ color: 'currentColor', size: '' }}>
      <WagmiConfig config={config}>
        <ConnectKitProvider options={{ hideBalance: true, enforceSupportedChains: false }}>
          <main className="container max-w-md px-4 py-8  space-y-4">
            <h1 className="flex gap-1 justify-center">
              <Ball>P</Ball>
              <Ball>O</Ball>
              <Ball>W</Ball>
              <Ball>E</Ball>
              <Ball>R</Ball>
              <Ball className="text-sm border-red-500 dark:border-red-500">BALD</Ball>
            </h1>
            {children}
          </main>
        </ConnectKitProvider>
      </WagmiConfig>
    </IconContext.Provider>
  )
}

function Ball({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        `border-2 dark:border-gray-400 rounded-full w-12 h-12 font-black text-3xl flex items-center justify-center`,
        className
      )}
    >
      {children}
    </span>
  )
}
