import React, {FC, useCallback, useMemo} from "react";
import {InlineSelectEditor, InlineSelectOptionValue} from "./InlineSelectEditor";
import * as Blenders from "color-blend";


const blenderNames: string[] = Object.keys(Blenders).sort(/*a-z*/);
const blenderNodes: InlineSelectOptionValue[] = blenderNames.map(name => ({
    type: "value",
    value: name,
    label: name,
}))

export interface InlineBlenderEditorProps {
    value: string,
    onChange: (value: string) => void
}

export const InlineBlenderEditor: FC<InlineBlenderEditorProps> = ({value, onChange}) => {

    const handleChange = useCallback((option: InlineSelectOptionValue) => {
        onChange(option.value);
    }, [onChange]);

    const currentValue = useMemo<InlineSelectOptionValue>(() => {
        return {
            value: value,
            label: value,
            type: "value"
        }
    }, [value]);

    return (
        <InlineSelectEditor
            value={currentValue}
            options={blenderNodes}
            onChange={handleChange}
            emptyText={"(no-blender)"}
        />

    );
}