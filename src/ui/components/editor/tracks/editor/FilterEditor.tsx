import React, {ChangeEvent, FC, useCallback, useContext, useMemo} from "react";
import "../../track-elements/ColorView.scss";
import {TrackContext} from "../../TrackContext";
import {ParseMeta} from "../../../../types/ParseMeta";
import {PlixFilterJsonData} from "@plix-effect/core/dist/types/parser";

export interface FilterEditorProps {
    filter: PlixFilterJsonData
    onChange: (type: null|"alias"|"constructor", value?: string) => void,
}
export const FilterEditor: FC<FilterEditorProps> = ({onChange, filter}) => {

    const {filterConstructorMap, track: { filters: filterAliasMap }} = useContext(TrackContext);

    const handleChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        const type = selectedValue.substring(0, 1);
        const value = selectedValue.substring(1);
        if (type === "X") return onChange(null);
        if (type === "A") return onChange("alias", value);
        if (type === "C") return onChange("constructor", value);
    }, []);

    const filterConstructorsData = useMemo(() => {
        return Object.keys(filterConstructorMap).sort(/*a-z*/).map((id) => {
            const filterConstructor = filterConstructorMap[id];
            const meta: ParseMeta = filterConstructor['meta'];
            return {
                name: meta.name,
                value: "C"+id,
            };
        });
    }, [filterConstructorMap]);

    const aliasData = useMemo(() => {
        return Object.keys(filterAliasMap).sort(/*a-z*/).map((name) => {
            return {
                name: name,
                value: "A"+name,
            };
        });
    }, [filterAliasMap]);

    const selectedId = useMemo<string>(() => {
        if (!filter) return "X";
        if (filter[1] !== null) return "C"+filter[1];
        return "A"+filter[2];
    }, [filter])

    return (<>
        <select value={selectedId} onChange={handleChange}>
            <option value="X">(no filter)</option>
            <optgroup label="aliases">
                {aliasData.map(data => (
                    <option key={data.value} value={data.value}>{data.name}</option>
                ))}
            </optgroup>
            <optgroup label="basic filters">
                {filterConstructorsData.map(data => (
                    <option key={data.value} value={data.value}>{data.name}</option>
                ))}
            </optgroup>
        </select>
    </>)
}