import React, {FC, useState} from "react";
import {
    FieldElementPixel,
    FieldElementPixelProperties
} from "../../../../../preview/canvas/preview-field/PreviewFieldElement";
import {InlineSimpleSelectEditor} from "../../inline/InlineSimpleSelectEditor";
import {InlineColorEditor} from "../../inline/InlineColorEditor";
import {PlixColor} from "@plix-effect/core/color";
import {InlineNumberEditor} from "../../inline/InlineNumberEditor";

interface PenSettingsPixelProps {
    value: FieldElementPixelProperties|null
    onChange: (val: FieldElementPixelProperties) => void
}

export const PenSettingsPixel: FC<PenSettingsPixelProps> = ({value, onChange}) => {

    const onChangeShape = (shape: FieldElementPixelProperties["shape"]) => {
        const clone = {...value};
        clone.shape = shape
        onChange(clone)
    }
    const onChangeSize = (size: FieldElementPixelProperties["size"]) => {
        const clone = {...value};
        clone.size = size;
        onChange(clone)
    }


    return (
        <>
            <div className={"pen-settings-option"}>
                <div className={"pen-settings-option-name"}>Shape:</div>
                <div className={"pen-settings-option-value"}>
                    <InlineSimpleSelectEditor value={value.shape} valueList={["circle","square"]} onChange={onChangeShape}/>
                </div>
            </div>
            <div className={"pen-settings-option"}>
                <div className={"pen-settings-option-name"}>Size:</div>
                <div className={"pen-settings-option-value"}>
                    <InlineNumberEditor min={10} onChange={onChangeSize} value={value.size}/>
                </div>
            </div>
        </>
    )
}