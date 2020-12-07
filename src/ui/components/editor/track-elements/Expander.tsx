import React, {FC, ReactNode, useCallback, useState, MouseEvent, Dispatch, SetStateAction} from "react";
import cn from "classnames";
import "./Expander.scss"

interface ExpanderProps {
    show: boolean,
    expanded: boolean,
    changeExpanded: () => void,
}
export const Expander: FC<ExpanderProps> = ({show = true, expanded, changeExpanded}) => {
    const onClick = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        event.stopPropagation();
        changeExpanded();
    }, [changeExpanded])
    return (
        <span onDragEnter={changeExpanded} className={cn("track-expander", show && (expanded ? "_expanded" : "_collapsed") )} onClick={onClick}>
            {expanded ? (
                <i className="far fa-minus-square"/>
            ) : (
                <i className="far fa-plus-square"/>
            )}
        </span>
    );
}

export const useExpander = (baseExpanded = false, show: boolean = true): [boolean, ReactNode, () => void, Dispatch<SetStateAction<boolean>>] => {
    const [expanded, setExpanded] = useState(baseExpanded);
    const changeExpanded = useCallback(() => {
        setExpanded(v => !v);
    }, [setExpanded]);
    return [
        expanded,
        <Expander show={show} expanded={expanded} changeExpanded={changeExpanded}/>,
        changeExpanded,
        setExpanded
    ]
}