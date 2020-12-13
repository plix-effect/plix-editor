import React, {FC, useCallback, useMemo, useState} from "react";
import "./InlineEditor.scss"
import {RGBAColor} from "@plix-effect/core/types";
import {parseColor} from "@plix-effect/core";
import { ChromePicker } from 'react-color'
import {PlixColorData, rgbaToNumber, toRgba} from "@plix-effect/core/color";
import Popup from "reactjs-popup";

export interface InlineColorEditorProps {
    value: PlixColorData,
    onChange: (color: PlixColorData) => void
}
export const InlineColorEditor: FC<InlineColorEditorProps> = ({value, onChange}) => {

    const rgbaColor = useMemo(() => toRgba(parseColor(value, null)), [value]);
    const styleColor = useMemo(() => getStyleColor(rgbaColor), [rgbaColor]);
    const [open, setOpen] = useState(false);

    const switchOpen = useCallback(() => {
        setOpen((v) => !v);
        if (open) {
            // Костыль. Нужно избавиться от reactjs-popup
            // Баг: создается 1 дивка для попапов, при закрытии не исчезает
            // Модалки открытые позже чем первый открытый попап - перекрывают любые попапы
            document.getElementById("popup-root").remove();
        }
    }, [setOpen, open])

    const [colorPickerValue, setColorPickerValue] = useState(rgbaColor)

    const handleChange = useCallback((changedColor) => {
        setColorPickerValue(changedColor.rgb);
    }, [onChange]);

    const submit = useCallback(() => {
        switchOpen();
        const newColor = toSaveColor(colorPickerValue);
        onChange(newColor);
    }, [colorPickerValue, onChange])


    const trigger = useMemo(() => {
        return (
            <div className={"ice-color-container"} title={"Click to edit"} onClick={switchOpen}>
                <div className={"ice-color"} style={{backgroundColor: styleColor}}/>
            </div>
        )
    }, [rgbaColor])

    return (
        <div className={"inline-color-editor"}>
            {
                open ?
                    <Popup trigger={trigger} position="bottom center" onClose={submit} open={open} onOpen={switchOpen}>
                        {open ? <ChromePicker color={ colorPickerValue } onChange={handleChange} /> : null}
                    </Popup>
                :
                    trigger
            }
        </div>
    );
}

function getStyleColor({r,g,b,a}: RGBAColor) {
    return `rgba(${r},${g},${b},${a})`
}

function toSaveColor(color: RGBAColor): number {
    return rgbaToNumber(color)
}