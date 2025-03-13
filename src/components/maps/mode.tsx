import { useUserStore } from "@/stores/user-store";
import { Switch } from "../ui/switch";
import { UserType } from "@/types";
import Image from "next/image";
import { useEffect } from "react";

export const Mode = () => {
  const { setType, type,allowSwitch } = useUserStore();

  useEffect(() => {
    const storedType = localStorage.getItem("userType") as UserType;
    if (storedType) {
      setType(storedType);
    } else {
      setType("DRIVER" as UserType);
      localStorage.setItem("userType", "DRIVER");
    }
  }, []);

  const handleUserType = () => {
    const newType = type === "CUSTOMER" ? "DRIVER" : "CUSTOMER";
    setType(newType as UserType);
    localStorage.setItem("userType", newType);
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
