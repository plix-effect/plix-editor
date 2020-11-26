import React, {FC, useCallback, useMemo} from "react";
import "./InlineEditor.scss"
import {InlineInputEditor} from "./InlineInputEditor";

export interface InlineNumberEditorProps {
    value: any,
    onChange: (value: any) => void
    step?: number|"any"
}
export const InlineNumberEditor: FC<InlineNumberEditorProps> = ({value, onChange, step="any"}) => {

    return (
        <InlineInputEditor value={value} onChange={onChange} inputParams={{type: "number", step: step}}/>
    )
}