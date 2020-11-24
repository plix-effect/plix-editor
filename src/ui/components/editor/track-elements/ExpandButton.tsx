import * as React from "react"
import {FC} from "react";
import "./ExpandButton.scss"

interface ExpandButtonProps {
    expanded: boolean,
    onClick: () => void
}

export const ExpandButton: FC<ExpandButtonProps> = ({expanded, onClick}) => {
    return (
        <a href="javascript:void.0" className={"ExpandButton"} onClick={onClick}>
            <span>{expanded ? "-" : "+"}</span>
        </a>
    )
}