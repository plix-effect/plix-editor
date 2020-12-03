import React, {
    FC,
    useCallback,
    useContext,
    useMemo,
} from "react";
import {InlineSelectEditor, InlineSelectOption, InlineSelectOptionValue} from "./InlineSelectEditor";
import {TIMELINE_LCM} from "@plix-effect/core";

const GRIDS = getDivisors(TIMELINE_LCM) as readonly number[];

type InlineSelectGridOptionValue = InlineSelectOptionValue & {numberValue: number};

const options: InlineSelectGridOptionValue[] = GRIDS.map(value => ({
    type: "value",
    value: String(value),
    label: "1:"+String(value),
    numberValue: value
}))

export interface InlineGridEditorProps {
    value: number,
    onChange: (value?: number) => void
}

export const InlineGridEditor: FC<InlineGridEditorProps> = ({value, onChange}) => {

    const handleChange = useCallback((selectedOption: InlineSelectGridOptionValue) => {
        onChange(selectedOption.numberValue);
    }, [onChange])

    const currentValue = useMemo<InlineSelectGridOptionValue>(() => ({
        type: "value",
        value: String(value),
        label: "1:"+String(value),
        numberValue: value
    }), [value])

    return (
        <InlineSelectEditor
            value={currentValue}
            options={options}
            onChange={handleChange}
            emptyText={"(no-grid)"}
        />
    );
}

function getDivisors(n): number[] {
    const res: number[] = [];
    for (let i=1; i<=Math.sqrt(n); i++) {
        if (n%i == 0) {
            if (n/i == i) res.push(i)
            else res.push(i, n/i)
        }
    }
    return res.sort((a,b) => {return a>b ? 1 : -1});
}