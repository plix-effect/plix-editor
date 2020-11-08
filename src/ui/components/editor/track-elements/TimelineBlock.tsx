import React, {FC} from "react";
import cn from "classnames"
import "./TimelineBlock.scss"

export const TimelineBlock: FC<{fixed?: boolean}> = ({children, fixed}) => {
    return (
        <div className={cn("track-timeline-block", {'--fixed': fixed})}>
            {children}
        </div>
    )
}