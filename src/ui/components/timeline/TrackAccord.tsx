import React, {CSSProperties, FC, ReactNode, useContext, useMemo, useState} from "react";
import {createPortal} from "react-dom";
import {PortalsContext, PortalsContextProps} from "./PortalsContext";

export interface TrackAccordProps {
    children: ReactNode
    expanded: boolean
}
export const TrackAccord: FC<TrackAccordProps> = ({expanded, children}) => {
    const {leftElement, rightElement} = useContext(PortalsContext);
    const [leftRef, setLeftRef] = useState<HTMLDivElement>();
    const [rightRef, setRightRef] = useState<HTMLDivElement>();


    const ctxValue: PortalsContextProps = {leftElement: leftRef, rightElement: rightRef}

    const leftStyle = useMemo<CSSProperties>(() => ({
        height: expanded ? "" : "0px",
        marginLeft: "10px",
        overflow: "hidden"
    }), [expanded]);
    const rightStyle = useMemo<CSSProperties>(() => ({
        height: expanded ? "" : "0px",
        overflow: "hidden"
    }), [expanded]);
    return (
        <>
            {leftElement && createPortal(<div className="accord-portal-left" ref={setLeftRef} style={leftStyle}/>, leftElement)}
            {rightElement && createPortal(<div className="accord-portal-right" ref={setRightRef} style={rightStyle} />, rightElement)}
            <PortalsContext.Provider value={ctxValue}>
                {children}
            </PortalsContext.Provider>
        </>
    );
}