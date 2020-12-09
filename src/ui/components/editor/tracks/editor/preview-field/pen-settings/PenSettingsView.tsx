import React, {FC, useCallback, useEffect, useMemo, useState} from "react";
import {
    FieldElement,
    FieldElementPixelProperties
} from "../../../../../preview/canvas/preview-field/PreviewFieldElement";
import "./PenSettingsView.scss"
import {InlineSimpleSelectEditor} from "../../inline/InlineSimpleSelectEditor";
import {PenSettingsPixel} from "./PenSettingsPixel";
import {DrawingFieldElement} from "../FieldElementEditor";

const DEFAULT_PIXEL_PROPS: FieldElementPixelProperties = {size: 25, shape: "circle"};

interface PenSettingsViewProps {
    onChange: (e: DrawingFieldElement) => void;
}

export const PenSettingsView: FC<PenSettingsViewProps> = ({onChange}) => {

    const [type,setType] = useState<FieldElement['type']>("pixel");
    const [circleProps,setCircleProps] = useState<FieldElementPixelProperties>(DEFAULT_PIXEL_PROPS);

    const setCirclePropsAndNotify = useCallback((props) => {
        const drawingEl = {type: type, props: props};
        setCircleProps(props);
        onChange(drawingEl);
    }, [onChange, setCircleProps, type])

    const optsView = useMemo<any>(() => {
        if (type === "line") {
            return (
                <div>Coming soon: true</div>
            )
        } else {
            return <PenSettingsPixel value={circleProps} onChange={setCirclePropsAndNotify}/>
        }
    }, [type, circleProps, setCirclePropsAndNotify])

    useEffect(() => {
        onChange({type: "pixel", props: circleProps})
    }, [])

    return (
        <div className={"pen-settings"}>
            <div className={"pen-settings-option"}>
                <div className={"pen-settings-option-name"}>Type:</div>
                <div className={"pen-settings-option-value"}>
                    <InlineSimpleSelectEditor onChange={setType} value={type} valueList={["pixel", "line"]}/>
                </div>
            </div>
            {optsView}
        </div>
    )
}