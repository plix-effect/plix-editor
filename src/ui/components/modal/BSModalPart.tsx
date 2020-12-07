import React, {FC, ReactNode, useContext, useMemo} from "react";


export type ModalCloseFN = () => void;
export interface CurrentModalInfo {
    instanceId: string,
    close: ModalCloseFN
}
export const CurrentModalContext = React.createContext<CurrentModalInfo>(null);

export type BSModalPartChildren = ReactNode | ((closeFn: ModalCloseFN) => ReactNode)
export interface BSModalPartProps {
    children: BSModalPartChildren
}
export const BSModalPart: FC<BSModalPartProps> = ({children}) => {
    const currentModalInfo = useContext(CurrentModalContext);

    const view = useMemo(() => {
        if (typeof children === "function") {
            const fn = children as (((closeFn: ModalCloseFN) => ReactNode));
            return fn(currentModalInfo.close)
        }
        return children;
    }, [children])

    return (
        <React.Fragment>
            {view}
        </React.Fragment>
    )
}