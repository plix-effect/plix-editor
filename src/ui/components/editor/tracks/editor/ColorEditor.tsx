import React, {ChangeEventHandler, FC, useCallback, useMemo} from "react";
import {HSLAColor} from "@plix-effect/core/types";
import {parseColor} from "@plix-effect/core";
import {colorToNumber, numberToColor} from "@plix-effect/core/color";
import "../../track-elements/ColorView.scss";

export interface ColorEditorProps {
    color: any,
    onChange: (color: any) => void
}
export const ColorEditor: FC<ColorEditorProps> = ({color, onChange}) => {

    const hslaColor = useMemo(() => parseColor(color, null), [color]);
    const htmlColor = useMemo(() => toHtmlColor(hslaColor), [hslaColor])

    const onChangeColor: ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
        onChange(toSaveColor(event.target.value, hslaColor[3]));
    }, [hslaColor]);
    const onChangeOpacity: ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
        onChange(toSaveColor(htmlColor, Number(event.target.value)));
    }, [htmlColor]);


    return (<>
        <span className="checkers_background">
            <input className="full-size-color-picker" type="color" value={htmlColor} onChange={onChangeColor} style={{opacity: hslaColor[3]}}/>
        </span>
        <input type="range" value={hslaColor[3]} min={0} max={1} step={1/255} onChange={onChangeOpacity}  style={{width: "255px"}}/>
        {Math.round(hslaColor[3]*255)} / 255
    </>)
}

function toHtmlColor(color: HSLAColor){
    return "#" + String((colorToNumber(color)>>>8).toString(16)).padStart(6, "0");
}

function toSaveColor(htmlColor: string, opacity: number): any{
    const opacityVal = Math.round(opacity*255)
    const colorVal = parseInt(htmlColor.substring(1), 16);
    return colorVal << 8 | opacityVal & 0xFF
}