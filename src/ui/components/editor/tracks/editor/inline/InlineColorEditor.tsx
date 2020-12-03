import React, {FC, useCallback, useMemo, useState} from "react";
import "./InlineEditor.scss"
import {RGBAColor} from "@plix-effect/core/types";
import {parseColor} from "@plix-effect/core";
import { ChromePicker } from 'react-color'
import {rgbaToNumber, toRgba} from "@plix-effect/core/color";
import Popup from "reactjs-popup";

export interface InlineColorEditorProps {
    value: any,
    onChange: (color: any) => void
}
export const InlineColorEditor: FC<InlineColorEditorProps> = ({value, onChange}) => {

    const rgbaColor = useMemo(() => toRgba(parseColor(value, null)), [value]);
    const styleColor = useMemo(() => getStyleColor(rgbaColor), [rgbaColor]);

    const [colorPickerValue, setColorPickerValue] = useState(rgbaColor)

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
    }, [rgbaColor])

    return (
        <div className={"inline-color-editor"}>
            <Popup trigger={trigger} position="bottom center" onClose={submit}>
                <ChromePicker color={ colorPickerValue } onChange={handleChange} />
            </Popup>
        </div>
    );
}

function getStyleColor({r,g,b,a}: RGBAColor) {
    return `rgba(${r},${g},${b},${a})`
}

function toSaveColor(color: RGBAColor): number {
    return rgbaToNumber(color)
}