import React, {FC, memo, ReactNode, useMemo, useRef, Fragment, useContext, useState, useCallback} from "react";
import {createPortal} from "react-dom";
import cn from "classnames";
import {PortalContext} from "./PortalContext";
import "./Track.scss";


export interface TrackProps {
    children: [ReactNode, ReactNode, ...ReactNode[]],
    nested?: boolean
    expanded?: boolean
}
export const Track: FC<TrackProps> = memo((
    {
        children: [leftChild, rightChild, ...childList],
        nested = false,
        expanded = true
    }
) => {
    const lastChild = useRef<ReactNode[]>([]);

    const child = useMemo<ReactNode[]>(() => {
        const flatChildren = settleKeys(childList, "k-");
        if (childrenIsEqual(lastChild.current, flatChildren)) return lastChild.current;
        lastChild.current = flatChildren;
        return lastChild.current;
    }, [childList]);

    return (
        <TrackBasic
            leftChild={leftChild}
            rightChild={rightChild}
            child={child}
            collapsed={!expanded}
            nested={nested}
        />
    );
});

interface TrackBasicProps {
    leftChild: ReactNode,
    rightChild: ReactNode,
    child: ReactNode[],
    collapsed: boolean,
    nested: boolean
}
const TrackBasic: FC<TrackBasicProps> = memo(({leftChild, rightChild, child, collapsed, nested}) => {

    const childRef = useRef({leftChild, rightChild, child, collapsed, nested});
    childRef.current = {leftChild, rightChild, child, collapsed, nested};

    const rightPortalEl = useContext(PortalContext);

    const [rightEl, setRightEl] = useState({});

    const updateRef = useCallback((el, key) => {
        setRightEl(state => {
            if (rightEl[key] === el) return state;
            return {...state, [key]: el};
        })
    }, [setRightEl]);

    const nextRightElements = useMemo(() => {
        return child.map((d, i) => {
            const key = String(d?.["key"] ?? i);
            return <RefUpdate key={key} index={key} updateRef={updateRef} />
        });
    }, [child, updateRef]);

    const right = useMemo( () => (
        <Fragment>
            {rightChild}
            {nextRightElements.length > 0 && (
                <div className={cn("track-right-block", {"_collapsed": collapsed, "_nested": nested})}>
                    {nextRightElements}
                </div>
            )}
        </Fragment>
    ), [rightChild, nextRightElements, collapsed, nested]);

    return (
        <Fragment>
            {leftChild}
            {child.length > 0 && (
                <div className={cn("track-left-block", {"_collapsed": collapsed, "_nested": nested})}>
                    {child.map((d, i) => {
                        const key = String(d?.["key"] ?? i);
                        return (
                            <PortalContext.Provider value={rightEl[key]} key={key}>
                                {d}
                            </PortalContext.Provider>
                        );
                    })}
                </div>
            )}
            {rightPortalEl && createPortal(right, rightPortalEl)}
        </Fragment>
    );
});

interface RefUpdateProps {
    index: string,
    updateRef: (element: Element, key: string) => void
}
const RefUpdate:FC<RefUpdateProps> = memo(({index, updateRef}) => {
    const updateRefCb = useCallback(ref => {
        updateRef(ref, index);
    }, [updateRef, index]);
    return (
        <div className="track_portal" ref={updateRefCb} />
    );
})

function canShowNode(node: ReactNode){
    if (node == null) return false;
    return typeof node !== "boolean";
}

function settleKeys(nodes: ReactNode[], startKey = "xx"): ReactNode[] {
    return nodes.filter(canShowNode).flatMap((node, index) => {

        if (Array.isArray(node)) {
            return settleKeys(node, startKey+":A_"+index);
        }
        const currentKey = node?.["key"] ? "K_"+node?.["key"] : "I_"+index;
        const key = startKey + ":" + currentKey;
        return [<Fragment key={key}>{node}</Fragment>]
    });
}

function childrenIsEqual(a?: ReactNode[], b?:ReactNode[]) {
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        const aNode = a[i];
        const bNode = b[i];
        if (!nodeIsEqual(aNode, bNode)) return false;
    }
    return true;
}

function nodeIsEqual(a: ReactNode, b: ReactNode){
    // if (a === b) return true;
    // if (typeof a === "object" && typeof b === "object") {
    //     return true;
    // }
    return false;

}