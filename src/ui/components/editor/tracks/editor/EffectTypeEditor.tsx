import React, {ChangeEvent, FC, useCallback, useContext, useMemo} from "react";
import "../../track-elements/ColorView.scss";
import {TrackContext} from "../../TrackContext";
import {ParseMeta} from "../../../../types/ParseMeta";
import {PlixEffectJsonData} from "@plix-effect/core/dist/types/parser";

export interface EffectTypeEditorProps {
    effect: PlixEffectJsonData
    onChange: (type: null|"alias"|"constructor", value?: string) => void,
}
export const EffectTypeEditor: FC<EffectTypeEditorProps> = ({onChange, effect}) => {

    const {effectConstructorMap, track: { effects: effectAliasMap }} = useContext(TrackContext);

    const handleChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        const type = selectedValue.substring(0, 1);
        const value = selectedValue.substring(1);
        if (type === "X") return onChange(null);
        if (type === "A") return onChange("alias", value);
        if (type === "C") return onChange("constructor", value);
    }, []);

    const effectConstructorsData = useMemo(() => {
        return Object.keys(effectConstructorMap).sort(/*a-z*/).map((id) => {
            const effectConstructor = effectConstructorMap[id];
            const meta: ParseMeta = effectConstructor['meta'];
            return {
                name: meta.name,
                value: "C"+id,
            };
        });
    }, [effectConstructorMap]);

    const aliasData = useMemo(() => {
        return Object.keys(effectAliasMap).sort(/*a-z*/).map((name) => {
            return {
                name: name,
                value: "A"+name,
            };
        });
    }, [effectAliasMap]);

    const selectedId = useMemo<string>(() => {
        if (!effect) return "X";
        if (effect[1] !== null) return "C"+effect[1];
        return "A"+effect[2];
    }, [effect])

    return (<>
        <select value={selectedId} onChange={handleChange}>
            <option value="X">(no effect)</option>
            <optgroup label="aliases">
                {aliasData.map(data => (
                    <option key={data.value} value={data.value}>{data.name}</option>
                ))}
            </optgroup>
            <optgroup label="basic effects">
                {effectConstructorsData.map(data => (
                    <option key={data.value} value={data.value}>{data.name}</option>
                ))}
            </optgroup>
        </select>
    </>)
}