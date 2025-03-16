import { useUserStore } from "@/stores/user-store";
import { Switch } from "../ui/switch";
import { UserType } from "@/types";
import { useEffect } from "react";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { useGetPendingRides } from "@/hook/solana";

export const Mode = () => {
  const { setType, type, allowSwitch,setDisableSwitch } = useUserStore();
  const wallet = useWallet();
  const {data: rides,refetch} = useGetPendingRides()
  useEffect(() => {
    console.log("mode")
    if(rides) {
        const filterData = rides.filter(item => ['ongoing','accepted','pending','completed'].includes(item?.account?.status))
        console.log(filterData) 
        if(filterData && filterData.length >= 1){
            setDisableSwitch(true)
        }
    }
  },[rides])

  useEffect(() => {
    let newType = type === "CUSTOMER" ? "DRIVER" : "CUSTOMER";
    const fetchUserType = async () => {
      if(wallet?.publicKey) {
        const walletPublicKey = wallet?.publicKey?.toString();
        const response = await fetch(`/api/users/${walletPublicKey}`);
        const data = await response.json();
        if (response.status === 404) {
          await fetch(`/api/users/${walletPublicKey}`, {
            method: "POST",
            body: JSON.stringify({ user_type: newType }),
            headers: {
              "Content-Type": "application/json",
            },
          }).then(() => {
            newType = newType;
          });
        } else {
          newType = data.user_type;
        }
        setType(newType as UserType);
      }
    }
    fetchUserType()
  }, [wallet])

  const handleUserType = async () => {
    if (wallet?.publicKey) {
      try {
        const newType = type === "CUSTOMER" ? "DRIVER" : "CUSTOMER";
        const walletPublicKey = wallet?.publicKey?.toString();
        await fetch(`/api/users/${walletPublicKey}`, {
            method: "PATCH",
            body: JSON.stringify({ user_type: newType }),
            headers: {
              "Content-Type": "application/json",
            },
          });
        setType(newType as UserType);
      } catch (error) {
        console.error("Error updating user type:", error);
      }
    }
  };

  return (
    <div className="flex gap-4 items-center">
      {type}
      <div className="flex flex-col items-center">
        <Switch
          id="airplane-mode"
          disabled={allowSwitch}
          onClick={handleUserType}
          checked={type === "CUSTOMER"}
        />
      </div>
    </div>
  );
};
