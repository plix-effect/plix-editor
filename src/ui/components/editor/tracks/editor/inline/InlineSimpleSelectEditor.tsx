import React, {FC, ReactElement, useCallback, useMemo} from "react";
import {InlineSelectEditor, InlineSelectOptionValue} from "./InlineSelectEditor";


type DisplayFN<T = any> = (val:T) => ReactElement;

export interface InlineSimpleSelectEditorProps<T = any> {
    value: T,
    valueList: T[]
    display?: DisplayFN<T>
    onChange: (value: T) => void
}

const valueToOptionValue = (val: any, displayFn: DisplayFN): InlineSelectOptionValue => {
    return {
        type: "value",
        value: val,
        label: displayFn(val)
    }
}

export const InlineSimpleSelectEditor: FC<InlineSimpleSelectEditorProps> = ({value, onChange, valueList, display = (v) => v.toString()}) => {

    const handleChange = useCallback((option: InlineSelectOptionValue) => {
        onChange(option.value);
    }, [onChange]);

    const currentValue = useMemo<InlineSelectOptionValue>(() => {
        return valueToOptionValue(value, display);
    }, [value, display]);

    const nodes = useMemo(() => {
        return valueList.map((v) => valueToOptionValue(v,display))
    },[valueList,display])

    return (
        <InlineSelectEditor
            value={currentValue}
            options={nodes}
            onChange={handleChange}
            allowEmpty={false}
        />

    );
}