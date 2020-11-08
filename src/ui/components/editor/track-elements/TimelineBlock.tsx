import React, {FC} from "react";
import cn from "classnames"
import "./TimelineBlock.scss"

export const TimelineBlock: FC<{fixed?: boolean}> = ({children, fixed}) => {
    return (
        <div className="track-timeline-block">
            <div className={cn("track-timeline-block-content", {'--fixed': fixed})}>
                {children}
            </div>
        </div>
    )
}