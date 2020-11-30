import React, {ChangeEvent, FC, MutableRefObject, useCallback, useEffect, useMemo, useRef, useState} from "react";
import "./InlineEditor.scss"
import {HSLAColor, RGBAColor} from "@plix-effect/core/types";
import {parseColor} from "@plix-effect/core";
import {useInlineEditableContainer} from "../../../../../use/useInlineEditableContainer";
import { ChromePicker } from 'react-color'
import {colorToNumber, hslaToRgba, rgbaToNumber} from "@plix-effect/core/color";
import Popup from "reactjs-popup";

export interface InlineColorEditorProps {
    value: any,
    onChange: (color: any) => void
}
export const InlineColorEditor: FC<InlineColorEditorProps> = ({value, onChange}) => {

    const hslaColor = useMemo(() => parseColor(value, null), [value]);
    const styleColor = useMemo(() => getStyleColor(hslaColor), [hslaColor]);

    const [colorPickerValue, setColorPickerValue] = useState(hslaToRgba(hslaColor))

    const handleChange = useCallback((changedColor) => {
        setColorPickerValue(changedColor.rgb);
    }, [onChange]);

    const submit = useCallback(() => {
        const newColor = toSaveColor(colorPickerValue);
        onChange(newColor);
    }, [colorPickerValue, onChange])


    const trigger = useMemo(() => {
        return (
            <div className={"ice-color-container"} title={"Click to edit"}>
                <div className={"ice-color"} style={{backgroundColor: styleColor}}/>
            </div>
        )
    }, [hslaColor])

    return (
        <div className={"inline-color-editor"}>
            <Popup trigger={trigger} position="bottom center" onClose={submit}>
                <ChromePicker color={ colorPickerValue } onChange={handleChange} />
            </Popup>
        </div>
    );
}

function getStyleColor(color: HSLAColor) {
    const h = color[0]*360;
    const s = color[1]*100;
    const l = color[2]*100;
    const a = color[3]*100;
    return `hsla(${h},${s}%,${l}%,${a}%)`
}

function toHtmlColor(color: HSLAColor){
    return "#" + String((colorToNumber(color)>>>8).toString(16)).padStart(6, "0");
}

function toSaveColor(color: RGBAColor): number {
    return rgbaToNumber(color)
}