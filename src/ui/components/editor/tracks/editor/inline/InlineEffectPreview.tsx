import React, {FC, useCallback, useContext, useMemo, useState} from "react";
import "./InlineEditor.scss"
import { withResizeDetector } from 'react-resize-detector';
import {PlixEffectJsonData} from "@plix-effect/core/types/parser";
import {ScaleDisplayContext} from "../../../ScaleDisplayContext";
import {CanvasStaticEffectPreview} from "../../../../preview/canvas/static/CanvasStaticEffectPreview";

export interface InlineEffectPreviewBaseProps {
    effect: PlixEffectJsonData,
    width: number,
    height: number
}
export const InlineEffectPreviewBase: FC<InlineEffectPreviewBaseProps> = ({width = 1, height = 1, effect}) => {
    const {duration} = useContext(ScaleDisplayContext);

    const [status, setStatus] = useState<"none" | "parse" | "render" | "done" | "error">("none");
    const [errorMessage, setErrorMessage] = useState<string|null>(null);

    const changeStatusHandler = useCallback((status, error) => {
        setStatus(status);
        setErrorMessage(error);
    }, []);

    return (<>
        <div className="inline-editor-effect-preview">
            <CanvasStaticEffectPreview width={width} height={height} duration={duration} render={effect} startTime={0} onChangeStatus={changeStatusHandler}/>
        </div>
        {status === "parse" && (
            <div>
                <i className="fas fa-hourglass-half"/> parsing
            </div>
        )}
        {status === "render" && (
            <div>
                <i className="fas fa-hourglass-half"/> rendering
            </div>
        )}
        {status === "error" && (
            <div>
                <i className="fas fa-exclamation-circle"/> {errorMessage}
            </div>
        )}
    </>);
}

interface InlineEffectPreviewProps {
    effect: PlixEffectJsonData
}
export const InlineEffectPreview: FC<InlineEffectPreviewProps> = withResizeDetector(InlineEffectPreviewBase, {refreshMode: "throttle" })