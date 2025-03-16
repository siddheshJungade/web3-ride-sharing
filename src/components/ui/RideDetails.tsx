import React, { useEffect, useState } from 'react'
import { lamportsToSol } from "@/lib/utils"
import { useUserStore } from '@/stores/user-store'
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { useConnection, useWallet, useAnchorWallet } from '@solana/wallet-adapter-react'
import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor'
import idl from '@/api/idl.json'
import { useQueryClient } from '@tanstack/react-query'
import * as moment from 'moment';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"


import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { Button } from './button'
import CompleteRideButton from './compleatRide'
import { useGetPendingRides } from '@/hook/solana'

const PROGRAM_ID = process.env.NEXT_PUBLIC_PROGRAM_ID!


interface RideDetailsProps {
  localRide: any
}

const RideStatus: any = {
    Pending: { pending: {} },
    Accepted: { accepted: {} },
    Ongoing: { ongoing: {} },
    Completed: { completed: {} },
    Cancelled: { cancelled: {} },
    Paid: { paid: {} },
    Done: {done:{}}
};



const DisplayRideStatus: any = {
    pending: "Pending",
    accepted: "Accepted",
    ongoing: "Ongoing",
    completed: "Completed",
    cancelled: "Cancelled",
    paid: "Paid"
};

const RideDetails: React.FC<RideDetailsProps> = ({ localRide }) => {

  const [ride, setRide] = useState(localRide);
  const queryClient = useQueryClient()

    useEffect(() => {
      setRide(localRide);
    }, [localRide]);

    const { type } = useUserStore()
    const { connection } = useConnection()
    const wallet = useAnchorWallet(); // Get the connected wallet
    const { refetch } = useGetPendingRides();


    const handleStatusChange = async (newStatus: string) => {
        if (!wallet) {
            console.error('Wallet not connected');
            return;
        }
        if (wallet.publicKey) {
            const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
            const program = new Program(idl as any, new PublicKey(PROGRAM_ID), provider);

            try {
                const tx = await program.methods
                    .updateRideStatus(RideStatus[newStatus])
                    .accounts({
                        trx: ride?.publicKey, // Transaction account
                        updater: wallet.publicKey, // Caller (driver or user)
                        systemProgram: web3.SystemProgram.programId
                    })
                    .rpc();
                
                await queryClient.invalidateQueries({ queryKey: ['get-pending-rides'] })
                await refetch();
                setRide({ ...ride, account: { ...ride.account, status: newStatus } }); // Update the ride state
            } catch (error) {
                console.error('Error updating ride status:', error)
            }
        }
    }


    return (
        ride  &&   
        <Card key={ride?.publicKey}  className="w-full mb-4 p-4 border border-gray-300 rounded-lg">
        <CardHeader>
          <CardDescription> <strong> User:  </strong>{ride.account.user}</CardDescription>

          {
             ride.account.driver && <CardDescription> <strong> Driver:  </strong>{ride.account.driver}</CardDescription>

          }
          <CardDescription> <strong> Ride Time :  </strong> { moment.unix(ride?.account?.timestamp).format('DD-MM-YYYY HH:mm:ss')} </CardDescription>

          <CardDescription> <strong> Status :  </strong> {DisplayRideStatus[ride.account.status]} </CardDescription>

        <CardDescription><strong>Pickup:</strong> {ride.account.pickupAddress}</CardDescription>
        <CardDescription><strong>Destination:</strong> {ride.account.destinationAddress}</CardDescription>
        <CardTitle>Fare : {lamportsToSol(ride.account.fare)} SOL </CardTitle>
        {(ride.account.status == "completed" && ride.account.user == wallet?.publicKey) && <CompleteRideButton ride={ride} />}
        {
            type == 'DRIVER' && ride.account.user != wallet?.publicKey &&  ['pending'].includes(ride.account.status)
            && <Button className="" onClick={() => {
              handleStatusChange("Accepted")
            }}> Accept Ride </Button>
        }

        {
            type == 'DRIVER' && ride.account.user != wallet?.publicKey && ride.account.status == "accepted"
            && <Button className="" onClick={() => {
              handleStatusChange("Ongoing")
            }}> Ongoing </Button>
        }


        {
            type == 'DRIVER' && ride.account.user != wallet?.publicKey && ride.account.status == "ongoing"
            && <Button className="" onClick={() => {
              handleStatusChange("Completed")
            }}> Completed </Button>
        }

        {
            type == 'CUSTOMER' && ride.account.user == wallet?.publicKey && ride.account.status == "pending"
            && <Button className="" onClick={() => {
              handleStatusChange("Cancelled")
            }}> Cancelled </Button>
        }
        </CardHeader>
      </Card>
    )
}

export default RideDetails