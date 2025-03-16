import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "./button"
import { useLocationStore, useUserStore } from "@/stores/user-store"
import { useEffect, useState } from "react"
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react"
import { useQueryClient } from "@tanstack/react-query"
import { AnchorProvider, Program, web3, BN } from "@project-serum/anchor"
import idl from '@/api/idl.json'
import { PublicKey } from "@solana/web3.js"
import { calculateDistance, calculateFare, lamportsToSol } from "@/lib/utils"
import { useGetPendingRides } from "@/hook/solana"

const PROGRAM_ID = process.env.NEXT_PUBLIC_PROGRAM_ID!

export const Modal = () => {
    const { pickup, destination, fare,setPickup,setDestination, setDistance, setFare} = useLocationStore()
    const [isLoading, setIsLoading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const { type,allowSwitch,setDisableSwitch } = useUserStore()
    const { connection } = useConnection()
    const wallet = useAnchorWallet(); // Get the connected wallet
    const queryClient = useQueryClient()
    const {data: rides,refetch} = useGetPendingRides()


    const handleRequestRide = async () => {
        setIsLoading(true)
        try {
            if (type == "CUSTOMER") {
                if (!wallet) {
                    console.error('Wallet not connected');
                    return;
                }
                const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
                const program = new Program(idl as any, new PublicKey(PROGRAM_ID), provider)

                // Generate a new keypair for the ride account
                const rideAccount = web3.Keypair.generate();

                // Call the `initialize_ride` function
                const tx = await program.methods
                    .initializeRide(
                        pickup?.lat,
                        pickup?.lng,
                        destination?.lat,
                        destination?.lng,
                        new BN(fare ?? 0) // Convert fare to BN (BigNumber)
                    )
                    .accounts({
                        user: wallet.publicKey,
                        trx: rideAccount.publicKey,
                        systemProgram: web3.SystemProgram.programId,
                    })
                    .signers([rideAccount])
                    .rpc();

                await queryClient.invalidateQueries({ queryKey: ['get-pending-rides'] })
                await refetch()
                console.log("Transaction successful:", tx);
                setPickup(null),
                setDestination(null)
                setIsDialogOpen(false); 
                alert(`Transaction successful: ${tx}`)              
            } else {
                alert("Can't Book Ride In Driver Mode If you want to Book Switch to Customer Mode Please")
                setIsDialogOpen(false); 
            }

        } catch (error) {
            alert(error)
            console.error('Error requesting ride:', error)
        } finally {
            setIsLoading(false)
            setIsDialogOpen(false); 
        }
    }

    const handleBookRide = () => {
        if(type == "CUSTOMER") {
          if (pickup && destination) {
            const calculatedDistance = calculateDistance(pickup, destination);
            const calculatedFare = calculateFare(calculatedDistance);
            setDistance(calculatedDistance)
            setFare(calculatedFare);  
            setIsDialogOpen(true)    
          }
        }else {
            setIsDialogOpen(false)
        }
      };

      useEffect(() => {
        // Ensure the button is disabled when pickup or destination is not set
        if (!pickup || !destination) {
            setIsDialogOpen(false);
        }
    }, [pickup, destination]);

    return <>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger disabled={!pickup || !destination  || type != "CUSTOMER" || allowSwitch} onClick={handleBookRide} className="bg-black text-white bw-[400px] px-3 py-2 border rounded-md  disabled:bg-gray-500" > Book Ride </DialogTrigger>
          {
           isDialogOpen && type === "CUSTOMER"  && <DialogContent>
            <DialogHeader>
                <DialogTitle>Ride Details {isDialogOpen}</DialogTitle>
                <DialogDescription>
                    From <DialogTitle>{pickup?.name}</DialogTitle>
                </DialogDescription>

                <DialogDescription>
                    To  <DialogTitle>{destination?.name}</DialogTitle>
                </DialogDescription>
            </DialogHeader>
            <DialogTitle>Ride Fare in SOL {lamportsToSol(fare!)}</DialogTitle>
            <Button
                className="w-full px-3 py-2 border rounded-md"
                disabled={!pickup || !destination || isLoading}
                onClick={handleRequestRide}
            >
                {isLoading ? "LOADING" : 'Request Ride'}
            </Button>  </DialogContent>
          }
        </Dialog>

    </>
}