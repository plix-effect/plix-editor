import React, {createContext, FC, ReactNode, useCallback, useContext, useEffect, useRef, useState,} from "react";
import { createPortal } from "react-dom";
import {SplitLeftRight} from "../divider/SplitLeftRight";


const effect = {name: "snake", desc: "snake-desc"}
export const TreeTimeline: FC = ({children}) => {
    const [leftRef, setLeftRef] = useState<HTMLDivElement>();
    const [rightRef, setRightRef] = useState<HTMLDivElement>();

    const ctxValue: PortalsContextProps = {leftElement: leftRef, rightElement: rightRef}

    return (
        <PortalsContext.Provider value={ctxValue}>
            <SplitLeftRight minLeft={100} minRight={200} storageKey="timeline">
                <div ref={setLeftRef} />
                <div ref={setRightRef} />
            </SplitLeftRight>
            <EffectTimeline effect={effect} />
        </PortalsContext.Provider>
    )
}

interface TimelineProps {
    children: [ReactNode, ReactNode, ReactNode]
}

interface PortalsContextProps {
    leftElement: Element|undefined,
    rightElement: Element|undefined,
}
const PortalsContext = createContext<PortalsContextProps>({leftElement: undefined, rightElement: undefined});
const Timeline: FC<any> = ({children: [left, right, deep]}) => {
    const {leftElement, rightElement} = useContext(PortalsContext);
    const [leftRef, setLeftRef] = useState<HTMLDivElement>();
    const [rightRef, setRightRef] = useState<HTMLDivElement>();

    const ctxValue: PortalsContextProps = {leftElement: leftRef, rightElement: rightRef}

    return (
        <>
            {leftElement && createPortal((
                <>
                    {left}
                    {deep && <div style={{marginLeft: "10px"}} ref={setLeftRef} />}
                </>
            ), leftElement)}
            {rightElement && createPortal((
                <>
                    {right}
                    {deep && <div style={{marginLeft: "10px"}} ref={setRightRef} />}
                </>
            ), rightElement)}
            <PortalsContext.Provider value={ctxValue}>
                {deep}
            </PortalsContext.Provider>

        </>
    )
}

interface TimelineAccordProps {
    children: ReactNode
    open: boolean
}
const TimelineAccord: FC<TimelineAccordProps> = ({open, children}) => {
    if (!open) return null;
    return <>{children}</>
}

interface EffectTimelineProps {
    effect: {name: string, desc: string}
}
const EffectTimeline: FC<EffectTimelineProps> = ({effect}) => {
    const [expanded, setExpanded] = useState(false);
    const changeExpanded = useCallback(() => {
        setExpanded(v => !v);
    }, [setExpanded])
    return (
        <Timeline>
            <div>
                <a onClick={changeExpanded}>{expanded ? '-' : '+'}</a>
                Effect: {effect.name}
            </div>
            <div>Desc: {effect.desc}</div>
            <TimelineAccord open={expanded}>
                <FilterListTimeline filters={effect} />
                <FilterListTimeline filters={effect} />
                <FilterListTimeline filters={effect} />
            </TimelineAccord>
        </Timeline>
    )
}

const FilterListTimeline: FC<any> = () => {
    return (
        <Timeline>
            <div>EffectName</div>
            <div>EffectDesc</div>
        </Timeline>
    )
}