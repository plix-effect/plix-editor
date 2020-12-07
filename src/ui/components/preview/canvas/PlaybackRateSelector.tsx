import React, {FC, useCallback, useMemo} from "react";
import {InlineSelectEditor, InlineSelectOptionValue} from "../../editor/tracks/editor/inline/InlineSelectEditor";


export interface PlaybackRateSelectorProps {
    value: number,
    onChange: (value: number) => void
}

const playbackValueToString =(val: number) => {
    return val.toFixed(2);
}

const playbackNodes: InlineSelectOptionValue[] = [0.25, 0.50, 1.00, 1.50, 2.00, 4.00, 8.00].map(val => ({
    type: "value",
    value: playbackValueToString(val),
    label: playbackValueToString(val),
}))

export const PlaybackRateSelector: FC<PlaybackRateSelectorProps> = ({value, onChange}) => {

    const handleChange = useCallback((option: InlineSelectOptionValue) => {
        onChange(Number(option.value));
    }, [onChange]);

    const currentValue = useMemo<InlineSelectOptionValue>(() => {
        return {
            value: playbackValueToString(value),
            label: playbackValueToString(value),
            type: "value"
        }
    }, [value]);

    return (
        <InlineSelectEditor
            value={currentValue}
            options={playbackNodes}
            onChange={handleChange}
            allowEmpty={false}
        />

    );
}