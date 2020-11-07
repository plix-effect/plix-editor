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
                <>
                    {left}
                    {deep && <div className="tl-portal-left" ref={setLeftRef} />}
                </>
            ), leftElement)}
            {rightElement && createPortal((
                <>
                    {right}
                    {deep && <div className="tl-portal-right" ref={setRightRef} />}
                </>
            ), rightElement)}
        </PortalsContext.Provider>
    )
}