import React, {
    FC,
    MutableRefObject,
    useCallback,
    useContext,
    useMemo,
} from "react";
import "./InlineEditor.scss"
import {ValueableRefType} from "./InlineEditor";
import {InlineSelectEditor, InlineSelectOption, InlineSelectOptionValue} from "./InlineSelectEditor";
import {PlixEffectJsonData} from "@plix-effect/core/dist/types/parser";
import {ParseMeta} from "../../../../../types/ParseMeta";
import {TrackContext} from "../../../TrackContext";

export interface InlineSelectEditorProps {
    effect: PlixEffectJsonData,
    onChange: (type: null|"alias"|"constructor", value?: string) => void
    valuaebleRef: MutableRefObject<ValueableRefType>
}
export const InlineEffectTypeEditor: FC<InlineSelectEditorProps> = ({effect, onChange, valuaebleRef}) => {

    const handleChange = useCallback((option: InlineSelectOptionValue) => {
        const selectedValue = option.value;
        const type = selectedValue.substring(0, 1);
        const value = selectedValue.substring(1);
        console.log("GETTED VALUE", value);
        if (type === "X") return onChange(null);
        if (type === "A") return onChange("alias", value);
        if (type === "C") return onChange("constructor", value);
    }, []);

    const {effectConstructorMap, track: { effects: effectAliasMap }} = useContext(TrackContext);

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

    const options: InlineSelectOption[] = useMemo(() => {
        const res: InlineSelectOption[] = [
            {
                type: "value",
                value: "X",
                label: "(no-effect)"
            },
            {
                type: "group",
                label: "aliases",
                options: aliasData.map(data => (
                    {
                        type: "value",
                        value: data.value,
                        label: data.name
                    }
                ))
            },
            {
                type: "group",
                label: "basic effects",
                options: effectConstructorsData.map(data => (
                    {
                        type: "value",
                        value: data.value,
                        label: data.name
                    }
                ))
            }
        ];
        return res;
    }, [])

    const selectedId = useMemo<string>(() => {
        if (!effect) return "X";
        if (effect[1] !== null) return "C"+effect[1];
        return "A"+effect[2];
    }, [effect]);

    console.log("SELECTED", selectedId);

    return (
        <InlineSelectEditor
            value={selectedId}
            options={options}
            onSubmit={handleChange}
            valuaebleRef={valuaebleRef}
        />
    );
}