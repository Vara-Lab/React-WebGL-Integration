import React, { createContext, useState } from "react";


interface Props {
    children: JSX.Element
}

interface SailsContextI {
    sails: any | null,
    setSails:  React.Dispatch<React.SetStateAction<any | null>> | null
}

export interface InitSailsI {
    idl?: string,
    network?: string
}

export const sailsContext = createContext<SailsContextI>({
    sails: null,
    setSails: null
});

export const SailsProvider = ({ children }: Props) => {
    const [sails, setSails] = useState<any | null>(null);

    return (
        <sailsContext.Provider
            value={{
                sails,
                setSails
            }}
        >
            { children }
        </sailsContext.Provider>
    );
}