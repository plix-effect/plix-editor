import React, {FC, ReactNode, useCallback, useState} from "react";
import cn from "classnames";
import "./Expander.scss"

interface ExpanderProps {
    show: boolean,
    expanded: boolean,
    changeExpanded: () => void,
}
export const Expander: FC<ExpanderProps> = ({show = true, expanded, changeExpanded}) => {
    return (
        <a className={cn("track-expander", show && (expanded ? "_expanded" : "_collapsed") )} onClick={changeExpanded} />
    )
}

export const useExpander = (baseExpanded = false, show: boolean = true): [boolean, ReactNode] => {
    const [expanded, setExpanded] = useState(baseExpanded);
    const changeExpanded = useCallback(() => {
        setExpanded(v => !v);
    }, [setExpanded]);
    return [
        expanded,
        <Expander show={show} expanded={expanded} changeExpanded={changeExpanded}/>
    ]
}