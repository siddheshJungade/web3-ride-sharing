'use client'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { BorshAccountsCoder } from '@project-serum/anchor'
import bs58 from 'bs58'
import idl from '@/api/idl.json'
import { getAddressFromLatLon } from '@/lib/utils'
import { useUserStore } from '@/stores/user-store'

const PROGRAM_ID = process.env.NEXT_PUBLIC_PROGRAM_ID!

interface RideAccount {
  user: string
  driver: string | null
  fare: string
  status: string
  pickupLat: number
  pickupLon: number
  destinationLat: number
  destinationLon: number
}

const useGetPendingRides = () => {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const {type} = useUserStore()
    return useQuery({
    queryKey: ['get-pending-rides',type],
    queryFn: async () => {
      try {
        const programPublicKey = new PublicKey(PROGRAM_ID)
        const coder = new BorshAccountsCoder(idl as any)

        const filters = []

        let accounts: any = []
        if (type === "DRIVER") {
          // Fetch rides where driver is None
          const driverNoneAccounts = await connection.getProgramAccounts(programPublicKey, {
            filters: [
              {
                memcmp: {
                  offset: 40, // Adjust this offset to the correct position of the driver field
                  bytes: bs58.encode(Buffer.from([0])) // Driver is None
                }
              }
            ]
          })
 
          // Fetch rides where driver is the current user
          const driverCurrentUserAccounts = await connection.getProgramAccounts(programPublicKey, {
            filters: [
              {
                memcmp: {
                  offset: 8 + 32, // Adjust this offset to the correct position of the driver field
                  bytes: bs58.encode(Buffer.from([1,...(publicKey?.toBytes() || [])])) // Driver is current user
                }
              }
            ]
          })
          // Combine the results
          accounts = [...driverNoneAccounts, ...driverCurrentUserAccounts]
        } else {
          // Fetch rides where user is the current user
          accounts = await connection.getProgramAccounts(programPublicKey, {
            filters: [
              {
                memcmp: {
                  offset: 8, 
                  bytes: bs58.encode(Buffer.from(publicKey?.toBytes() || []))
                }
              }
            ]
          })
        }
        let rideAccounts = []
        if(accounts && accounts.length > 0) {
           rideAccounts = await Promise.all(accounts.map(async ({ pubkey, account }: any) => {
            const decodedData = coder.decode('Ride', account.data)
            const [pickupAddress, destinationAddress] = await Promise.all([
                getAddressFromLatLon(decodedData.pickupLat, decodedData.pickupLon),
                getAddressFromLatLon(decodedData.destinationLat, decodedData.destinationLon)
            ]);
            
            return {
              publicKey: pubkey.toString(),
              account: {
                user: decodedData.user.toString(),
                driver: decodedData.driver ? decodedData.driver.toString() : null,
                fare: decodedData.fare.toString(),
                status: Object.keys(decodedData.status)[0],
                pickupLat: decodedData.pickupLat,
                pickupLon: decodedData.pickupLon,
                destinationLat: decodedData.destinationLat,
                destinationLon: decodedData.destinationLon,
                pickupAddress,
                destinationAddress,
                timestamp: decodedData.timestamp
              }
            }
          }));
        }
        console.log("ride-from-api",rideAccounts)
        return rideAccounts;
      } catch (error) {
        console.error("Error fetching rides:", error)
        throw error
      }
    }
  })
}

export { useGetPendingRides }