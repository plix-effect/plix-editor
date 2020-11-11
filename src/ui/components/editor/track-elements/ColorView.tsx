import React, {FC, ReactNode, useCallback, useState} from "react";
import cn from "classnames";
import "./ColorView.scss"
import {HSLAColor} from "@plix-effect/core/types";

interface ColorViewProps {
    background: boolean
    color: HSLAColor
}
export const ColorView: FC<ColorViewProps> = ({background, color: [h, s, l, a]}) => {
    const htmlColor = `hsla(${h*360}, ${s*100}% , ${l*100}%, ${a})`
    return (
        <span className={cn("color-view-block", {"checkers_background": background})}>
            <span className="color-view-block-fill" style={{backgroundColor: htmlColor}} />
        </span>
    )
}