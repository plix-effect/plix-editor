import {createContext} from "react";

export interface PortalsContextProps {
    leftElement: Element|undefined,
    rightElement: Element|undefined,
}
export const PortalsContext = createContext<PortalsContextProps>({
    leftElement: undefined,
    rightElement: undefined
});