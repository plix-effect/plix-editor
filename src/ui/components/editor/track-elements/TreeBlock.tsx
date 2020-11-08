import React, {FC} from "react";
import "./TreeBlock.scss"

export const TreeBlock: FC = ({children}) => {
    return (
        <div className="track-tree-block">
            {children}
        </div>
    )
}