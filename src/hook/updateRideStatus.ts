import { useCallback } from 'react';
import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor';
import { PublicKey, SystemProgram } from "@solana/web3.js";
import idl from '@/api/idl.json';

const PROGRAM_ID = process.env.NEXT_PUBLIC_PROGRAM_ID!;

const RideStatus: any = {
    Pending: { pending: {} },
    Accepted: { accepted: {} },
    Ongoing: { ongoing: {} },
    Completed: { completed: {} },
    Cancelled: { cancelled: {} },
    Paid: { paid: {} },
    Done: {done: {}}
};

export const useHandleStatusChange = (wallet: any, connection: any,refetch: any) => {
    return useCallback(async (newStatus: string, ride: any) => {

        if (!wallet) {
            console.error("Wallet not connected");
            return;
        }

        if (wallet.publicKey) {
            const provider = new AnchorProvider(
                connection,
                wallet,
                AnchorProvider.defaultOptions()
            );
            const program = new Program(idl as any, new PublicKey(PROGRAM_ID), provider);

            try {
                const tx = await program.methods
                    .updateRideStatus(RideStatus[newStatus])
                    .accounts({
                        trx: ride?.publicKey, // Transaction account
                        updater: wallet?.publicKey, // Caller (driver or user)
                        systemProgram: SystemProgram.programId,
                    })
                    .rpc();

            } catch (error) {
                console.error("Error updating ride status:", error);
            } finally {
                refetch()
            }
        }
    }, [wallet, connection,refetch]);
};
