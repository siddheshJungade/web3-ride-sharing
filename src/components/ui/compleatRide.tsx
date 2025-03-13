'use client';

import  {useHandleStatusChange}  from '@/hook/updateRideStatus'
import { useState } from 'react';
import { useAnchorWallet, useConnection, useWallet, WalletContextState } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import idl from '@/api/idl.json'
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useTransferSol } from '../account/account-data-access';
import { AppModal } from './ui-layout';
import { lamportsToSol } from '@/lib/utils';
import {useQueryClient } from '@tanstack/react-query';
import { useGetPendingRides } from '@/hook/solana';


const PROGRAM_ID = process.env.NEXT_PUBLIC_PROGRAM_ID!

export default function CompleteRideButton({ ride }: { ride: any}) {
  const wallet = useAnchorWallet();
  const { publicKey } = useWallet();

  const [loading, setLoading] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false)
  
  return (
    <>
    {showSendModal && <ModalSend  ride={ride} address={new PublicKey(wallet?.publicKey!)} show={showSendModal} hide={ () => setShowSendModal(false)}  />} 
    <button onClick={() => setShowSendModal(true) } disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded">
      {loading ? 'Processing...' : 'Pay To Driver'}
    </button>
    </>
  );
}




function ModalSend({ hide, show, address,ride }: { hide: () => void; show: boolean; address: PublicKey, ride: any }) {
  const wallet = useAnchorWallet()
  const mutation = useTransferSol({ address })
  const { connection } = useConnection();
  const queryClient = useQueryClient()
  const { refetch } = useGetPendingRides();
  const handleStatusChange = useHandleStatusChange(wallet, connection,refetch);
  const [destination, setDestination] = useState(ride?.account.driver)
  const [amount, setAmount] = useState(lamportsToSol(ride?.account?.fare))


  if (!address || !wallet) {
    return <div>Wallet not connected</div>
  }

  return (
    <AppModal
      hide={hide}
      show={show}
      title="Pay to Driver"
      submitDisabled={!destination || !amount || mutation.isPending}
      submitLabel="Send"
      submit={() => {
        mutation
          .mutateAsync({
            destination: new PublicKey(destination),
            amount: parseFloat(amount.toString()),
          })
          .then(() => {
            try {
                handleStatusChange("Paid", ride)
                hide()
            } catch(err){

            }
          })
      }}
    >
      <input
        disabled={true}
        type="text"
        placeholder="Destination"
        className="input input-bordered w-full"
        value={destination}
      />
      <input
        disabled={true}
        type="number"
        step="any"
        min="1"
        placeholder="Amount"
        className="input input-bordered w-full"
        value={amount}
      />
    </AppModal>
  )
}