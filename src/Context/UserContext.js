import React, {useContext, useState} from 'react';

export const UserContext = React.createContext({
  savedInterest: [],
  updateSavedInterest: () => {},
});

export const UserProvider = ({children}) => {
  const [savedInterest, setSavedInterest] = useState([]);
  return (
    <UserContext.Provider
      value={{
        savedInterest,
        updateSavedInterest: setSavedInterest,
      }}>
      {children}
    </UserContext.Provider>
  );
};

export const useSavedInterest = () => {
  const {savedInterest, updateSavedInterest} = useContext(UserContext);
  return {savedInterest, updateSavedInterest};
};
