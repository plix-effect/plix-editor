import React, {FC, MouseEventHandler} from "react";
import cn from "classnames"
import "./TimelineBlock.scss"

type TimelineBlockType = "default" | "description" | "timeline" | "title";

interface TimelineBlockProps {
    fixed?: boolean,
    type?: TimelineBlockType
    onClick?: MouseEventHandler<HTMLDivElement>
}
export const TimelineBlock: FC<TimelineBlockProps> = ({children, onClick, fixed = false, type = "default"}) => {
    return (
        <div onClick={onClick} className={cn("track-timeline-block", `_${type}`)}>
            <div className={cn("track-timeline-block-content", {'_fixed': fixed})}>
                {children}
            </div>
        </div>
    )
}