import React, {FC} from "react";
import cn from "classnames"
import "./TreeBlock.scss"

type TimelineBlockType = "default" | "description"
interface TreeBlockProps {
    type?: TimelineBlockType
}
export const TreeBlock: FC<TreeBlockProps> = ({children, type = "default"}) => {
    return (
        <div className={cn("track-tree-block", `_${type}`)}>
            {children}
        </div>
    )
}