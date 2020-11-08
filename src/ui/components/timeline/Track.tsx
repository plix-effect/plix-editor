import React, {FC, ReactElement, ReactNode, useContext, useState} from "react";
import {createPortal} from "react-dom";
import {PortalsContext, PortalsContextProps} from "./PortalsContext";

export interface TrackProps {
    children: [ReactNode, ReactNode] | [ReactNode, ReactNode, ReactElement]
}
export const Track: FC<TrackProps> = ({children: [left, right, deep]}) => {
    const {leftElement, rightElement} = useContext(PortalsContext);
    const [leftRef, setLeftRef] = useState<HTMLDivElement>();
    const [rightRef, setRightRef] = useState<HTMLDivElement>();

    const ctxValue: PortalsContextProps = {leftElement: leftRef, rightElement: rightRef}

    return (
        <PortalsContext.Provider value={ctxValue}>
            {deep}
            {leftElement && createPortal((
                <div className="tl-portal-left" ref={setLeftRef} >
                    {left}
                </div>
            ), leftElement)}
            {rightElement && createPortal((
                <div className="tl-portal-right" ref={setRightRef}>
                    {right}
                </div>
            ), rightElement)}
        </PortalsContext.Provider>
    )
}