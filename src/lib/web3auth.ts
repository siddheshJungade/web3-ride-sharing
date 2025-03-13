import { Web3Auth } from "@web3auth/web3auth";
import { CHAIN_NAMESPACES } from "@web3auth/base";

const clientId = "BJpsyrGFKWDkNxzH0R3vJ52u6xOhTMPGcFoXUmnfadZh9MlhrhNoOrDRHLdbb8SYB9bt3PCbnoQdsynn--h2KS4"; // Get your Client ID from Web3Auth Dashboard

const web3auth = new Web3Auth({
  clientId,
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.SOLANA,
    chainId: "0x2", // Devnet chain ID
    rpcTarget: "https://api.devnet.solana.com", // Devnet RPC URL
  },
});

export default web3auth;