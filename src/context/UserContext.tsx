import { Preferences } from "@capacitor/preferences";
import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";

interface UserContextType {
  user: UserType;
  setUser: (user: UserType) => void;
  removeUser: () => void;
}

type UserType = {id : number, name : string , email: string} | null;

const UserContext = createContext<UserContextType | undefined>(undefined);


export const UserContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, _setUser] = useState<UserType>(null);

  const getUser = async () => {
    const user = await Preferences.get({
      key: "User",
    });

    if (user.value) {
      _setUser(JSON.parse(user.value));
    }
  };

  useEffect(() => {
    getUser();
  },[])

  const setUser = async (user: UserType) => {
    _setUser(user);
    await Preferences.set({
      key: "User",
      value: JSON.stringify(user),
    });
  };

  const removeUser = async () => {
    _setUser(null);
    await Preferences.remove({
      key: "User",
    });
  };

  return (<UserContext.Provider value={{ user,setUser,removeUser }}>
    {children}
  </UserContext.Provider>
    
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }
  return context;
};

