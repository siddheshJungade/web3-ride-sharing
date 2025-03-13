'use client'

import { useEffect, useState } from "react";
import { useGetPendingRides } from "@/hook/solana";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RideListContent from "@/components/ui/RideListContent";
import { useUserStore } from "@/stores/user-store";
import web3auth from "@/lib/web3auth";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/components/solana/solana-provider";

export default function RidesPage() {
  const { type, setDisableSwitch} = useUserStore();
  const { data: rides, isLoading, error } = useGetPendingRides();
  const [activeTab, setActiveTab] = useState("pending");
  const [user, setUser] = useState<any>(null);

  const wallet = useAnchorWallet()
  // useEffect(() => {
  //   const init = async () => {
  //     await web3auth.initModal();
  //     if (web3auth.provider) {
  //       const user = await web3auth.getUserInfo();
  //       setUser(user);
  //     }
  //   };
  //   init();
  // }, []);

  // const login = async () => {
  //   await web3auth.connect();
  //   const user = await web3auth.getUserInfo();
  //   setUser(user);
  // };

  // const logout = async () => {
  //   await web3auth.logout();
  //   setUser(null);
  // };

  useEffect(() => {
    if(rides) {
      let statusList = ["ongoing","accepted","completed"]

      if(type == "CUSTOMER") {
        statusList.push("pending")
      }
      console.log(statusList)
      const existingRide = rides?.filter(ride => statusList.includes(ride.account.status))
      if(existingRide && existingRide.length > 0) {
        setDisableSwitch(true) 
        return
      } else {
        setDisableSwitch(false)
      }
    } else {
      setDisableSwitch(false)
    }
  },[rides])

  const filteredRides = rides
    ? rides.filter((ride: any) => {
        if (activeTab === "ongoing") {
          return ["ongoing","pending","accepted"].includes(ride.account.status);
        }
        if(activeTab === "history") {
          return ["paid","cancelled"].includes(ride.account.status)
        }
        return ride.account.status === "completed";
      })
    : [];

  return (
    <div className="">
      {/* {user ? */}

      {!wallet &&   <WalletButton />}

      {wallet  &&         <div>
          {/* <button onClick={logout}>Logout</button> */}
          <Tabs defaultValue={"ongoing"} value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white flex  space-x-4 mb-4">
              <TabsTrigger
                value="completed"
                className={`px-4 py-2 ${activeTab === "completed" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                Yet To Paid
              </TabsTrigger>
              <TabsTrigger
                value="ongoing"
                className={`px-4 py-2 ${activeTab === "ongoing" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                Current Rides
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className={`px-4 py-2 ${activeTab === "history" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                History
              </TabsTrigger>
            </TabsList>
            <TabsContent value="completed">
              <RideListContent isLoading={isLoading} error={error} rides={filteredRides} />
            </TabsContent>
            <TabsContent value="ongoing">
              <RideListContent isLoading={isLoading} error={error} rides={filteredRides} />
            </TabsContent>
            <TabsContent value="history">
              <RideListContent isLoading={isLoading} error={error} rides={filteredRides} />
            </TabsContent>
          </Tabs>
        </div>}
       

      {/* : (
        <button onClick={login}>Login with Web3</button>
      )} */}
    </div>
  );
}