import React, {FC, useCallback, useMemo, useState} from "react";
import "../inline/InlineEditor.scss"
import {RGBAColor} from "@plix-effect/core/types";
import {parseColor} from "@plix-effect/core";
import {rgbaToNumber, toRgba} from "@plix-effect/core/color";
import {PlixGradientData} from "@plix-effect/core/dist/parser/parseGradient";
import "./GradientEditor.scss"
import {PreviewFieldConfig} from "../../../../preview/canvas/dynamic/preview-field/PlixCanvasField";
import {GradientEditorModal} from "./GradientEditorModal";
import {gradientToHtmlString} from "./gradient-editor-utils";

export interface GradientEditorProps {
    value: PlixGradientData,
    onChange: (gradient: PlixGradientData) => void
}
export const GradientEditor: FC<GradientEditorProps> = ({value, onChange}) => {
    const [open, setOpen] = useState(false);

    const onClose = useCallback((value: PlixGradientData|null) => {
        setOpen(false);
        onChange(value);
    }, [setOpen])
    const openModal = useCallback(() => {
        setOpen(true);
    }, [setOpen])

    const htmlGradient = useMemo(() => {
        return gradientToHtmlString(value)
    }, [value])
    return (
        <div className={"grady-editor-container"}>
            <div className={"grady-editor-trigger"} style={{background: htmlGradient}} title={"Click to edit"} onClick={openModal}/>
            <GradientEditorModal value={value} close={onClose} isOpen={open}/>
        </div>
    );
}
