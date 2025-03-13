'use client'

import { getRidewebProgram, getRidewebProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useRidewebProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getRidewebProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getRidewebProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['rideweb', 'all', { cluster }],
    queryFn: () => program.account.rideweb.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['rideweb', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ rideweb: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useRidewebProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useRidewebProgram()

  const accountQuery = useQuery({
    queryKey: ['rideweb', 'fetch', { cluster, account }],
    queryFn: () => program.account.rideweb.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['rideweb', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ rideweb: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['rideweb', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ rideweb: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['rideweb', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ rideweb: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['rideweb', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ rideweb: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
