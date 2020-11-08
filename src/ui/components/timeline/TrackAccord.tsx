import React, {CSSProperties, FC, ReactNode, useContext, useMemo, useState} from "react";
import {createPortal} from "react-dom";
import {PortalsContext, PortalsContextProps} from "./PortalsContext";
import cn from "classnames";
import "./TrackAccord.scss";

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
        overflow: expanded ? "" : "hidden"
    }), [expanded]);
    const rightStyle = useMemo<CSSProperties>(() => ({
        height: expanded ? "" : "0px",
        overflow: expanded ? "" : "hidden"
    }), [expanded]);
    return (
        <>
            {leftElement && createPortal(
                <div className={cn("accord-portal-left", {_expanded: expanded})} ref={setLeftRef}/>,
                leftElement
            )}
            {rightElement && createPortal(
                <div className={cn("accord-portal-right", {_expanded: expanded})} ref={setRightRef}/>,
                rightElement
            )}
            <PortalsContext.Provider value={ctxValue}>
                {children}
            </PortalsContext.Provider>
        </>
    );
}