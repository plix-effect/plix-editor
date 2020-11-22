import React, {FC} from "react";
import cn from "classnames"
import "./TimelineBlock.scss"

type TimelineBlockType = "default" | "description" | "timeline";

interface TimelineBlockProps {
    fixed?: boolean,
    type?: TimelineBlockType
}
export const TimelineBlock: FC<TimelineBlockProps> = ({children, fixed = false, type = "default"}) => {
    return (
        <div className={cn("track-timeline-block", `_${type}`)}>
            <div className={cn("track-timeline-block-content", {'_fixed': fixed})}>
                {children}
            </div>
        </div>
    )
}