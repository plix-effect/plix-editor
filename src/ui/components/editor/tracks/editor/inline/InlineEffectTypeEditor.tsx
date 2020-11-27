import React, {
    FC,
    useCallback,
    useContext,
    useMemo,
} from "react";
import {
    InlineSelectEditor,
    InlineSelectOptionGroup,
    InlineSelectOptionValue
} from "./InlineSelectEditor";
import {PlixEffectAliasJsonData, PlixEffectJsonData} from "@plix-effect/core/dist/types/parser";
import {ParseMeta} from "../../../../../types/ParseMeta";
import {TrackContext} from "../../../TrackContext";
import {ConstructorContext} from "../../../ConstructorContext";

interface EffectInlineSelectOptionValue extends InlineSelectOptionValue {
    effectType: null|"ALIAS"|"CONSTRUCTOR"
}
interface EffectInlineSelectOptionGroup extends InlineSelectOptionGroup {
    options: EffectInlineSelectOptionValue[]
}
type EffectInlineSelectOption = EffectInlineSelectOptionValue|EffectInlineSelectOptionGroup

const NO_EFFECT_OPTION:EffectInlineSelectOptionValue = (
    {
        type: "value",
        value: "X",
        label: "(no-effect)",
        effectType: null
    }
)

export interface InlineSelectEditorProps {
    effect: PlixEffectJsonData,
    onChange: (type: null|"alias"|"constructor", value?: string) => void
}

export const InlineEffectTypeEditor: FC<InlineSelectEditorProps> = ({effect, onChange}) => {

    const handleChange = useCallback((option: EffectInlineSelectOptionValue) => {
        const type = option.effectType;
        const value = option.value.substr(1);
        if (type === null) return onChange(null);
        if (type === "ALIAS") return onChange("alias", value);
        if (type === "CONSTRUCTOR") return onChange("constructor", value);
    }, []);

    const {effectConstructorMap} = useContext(ConstructorContext);
    const {track: { effects: effectAliasMap }} = useContext(TrackContext);

    const effectConstructorsData = useMemo(() => {
        return Object.keys(effectConstructorMap).sort(/*a-z*/).map((id) => {
            const effectConstructor = effectConstructorMap[id];
            const meta: ParseMeta = effectConstructor['meta'];
            return {
                name: meta.name,
                value: id,
            };
        });
    }, [effectConstructorMap]);

    const aliasData = useMemo(() => {
        return Object.keys(effectAliasMap).sort(/*a-z*/).map((name) => {
            return {
                name: name,
                value: name,
            };
        });
    }, [effectAliasMap]);

    const options: EffectInlineSelectOption[] = useMemo(() => {
        const res: EffectInlineSelectOption[] = [
            NO_EFFECT_OPTION,
            {
                type: "group",
                label: "aliases",
                options: aliasData.map(data => (
                    {
                        type: "value",
                        value: "A"+data.value,
                        label: <span><i className="fa fa-link"/> {data.name}</span>,
                        effectType: "ALIAS"
                    }
                ))
            },
            {
                type: "group",
                label: "basic effects",
                options: effectConstructorsData.map(data => (
                    {
                        type: "value",
                        value: "C"+data.value,
                        label: data.name,
                        effectType: "CONSTRUCTOR"
                    }
                ))
            }
        ];
        return res;
    }, [aliasData, effectConstructorsData]);

    const currentValue = useMemo<EffectInlineSelectOptionValue>(() => {
        if (effect == null) {
            return NO_EFFECT_OPTION
        } else {
            if (effect[1] == null) { // Alias
                const alias = effect as PlixEffectAliasJsonData;
                return {
                    value: "A"+alias[2],
                    label: <span><i className="fa fa-link"/> {alias[2]}</span>,
                    effectType: "ALIAS",
                    type: "value"
                }
            } else if (effect[1] !== null) {
                return {
                    value: "C"+effect[1],
                    label: effect[1],
                    effectType: "CONSTRUCTOR",
                    type: "value"
                }
            }
        }
    }, [effect, options])

    return (
        <InlineSelectEditor
            value={currentValue}
            options={options}
            onChange={handleChange}
            emptyText={"(no-effect)"}
        />

    );
}