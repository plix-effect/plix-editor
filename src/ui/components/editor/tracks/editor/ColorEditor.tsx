import React, {ChangeEventHandler, FC, FormEventHandler, useCallback, useEffect, useMemo, useState} from "react";
import {TimelineBlock} from "../../track-elements/TimelineBlock";
import {HSLAColor} from "@plix-effect/core/types";
import {parseColor} from "@plix-effect/core";
import {colorToNumber, numberToColor} from "@plix-effect/core/color";
import "../../track-elements/ColorView.scss";

export interface ColorEditorProps {
    color: any,
    onChange: (color: HSLAColor) => void
}
export const ColorEditor: FC<ColorEditorProps> = ({color, onChange}) => {

    const hslaColor = useMemo(() => parseColor(color, null), [color]);

    const [htmlColor, setHtmlColor] = useState(() => {
        return toHtmlColor(hslaColor);
    });
    const [htmlOpacity, setHtmlOpacity] = useState(() => {
        return hslaColor[3];
    });
    const onChangeColor: ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
        setHtmlColor(event.target.value);
    }, []);
    const onChangeOpacity: ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
        setHtmlOpacity(Number(event.target.value));
    }, []);

    useEffect(() => {
        setHtmlColor(toHtmlColor(hslaColor));
        setHtmlOpacity(hslaColor[3]);
    }, [hslaColor]);

    const onSubmit: FormEventHandler<HTMLFormElement> = useCallback((event) => {
        event.preventDefault();
        onChange(toHSLAColor(htmlColor, htmlOpacity))
    }, [htmlColor, htmlOpacity]);

    return (
        <form key={JSON.stringify(color)} onSubmit={onSubmit}>
            color:
            <span className="checkers_background">
                <input className="full-size-color-picker" type="color" value={htmlColor} onChange={onChangeColor} style={{opacity: htmlOpacity}}/>
            </span>
            opacity:
            <input type="range" value={htmlOpacity} min={0} max={1} step={0.001} onChange={onChangeOpacity} />
            <button type="submit"> ok </button>
            <button type="reset"> reset </button>
        </form>
    )
}

function toHtmlColor(color: HSLAColor){
    return "#" + String((colorToNumber(color)>>>8).toString(16)).padStart(6, "0");
}

function toHSLAColor(htmlColor: string, opacity: number): HSLAColor{
    const colorNum = parseInt(htmlColor.substring(1)+"00", 16);
    const [h,s,l] = numberToColor(colorNum);
    return [h,s,l, opacity]
}