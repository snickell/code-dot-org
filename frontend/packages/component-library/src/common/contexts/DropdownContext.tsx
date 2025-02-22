import React, {createContext, useContext, useState, ReactNode} from 'react';

/**
 * Dropdown context is used to manage that only one of CheckboxDropdowns is open at a time.
 */
const DropdownContext = createContext({
  activeDropdownName: '',
  /**
   * This is a dummy function to satisfy the type checker
   * */
  setActiveDropdownName: (name: string) => {
    void name;
  },
});

export const useDropdownContext = () => useContext(DropdownContext);

export const DropdownProviderWrapper: React.FC<{children: ReactNode}> = ({
  children,
}) => {
  const [activeDropdownName, setActiveDropdownName] = useState('');

  return (
    <DropdownContext.Provider
      value={{activeDropdownName, setActiveDropdownName}}
    >
      {children}
    </DropdownContext.Provider>
  );
};
