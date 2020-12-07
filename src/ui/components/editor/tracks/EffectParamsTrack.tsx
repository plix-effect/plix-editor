import React, {
    FC,
    memo,
    useContext,
    useMemo,
} from "react";
import {EditorPath} from "../../../types/Editor";
import {ValueTrack} from "./ValueTrack";
import {
    EditValueAction,
    MultiActionType
} from "../PlixEditorReducerActions";
import {Track} from "../../timeline/Track";
import "./ArrayElementsTrack.scss";
import {PlixEffectJsonData} from "@plix-effect/core/types/parser";
import {ConstructorContext} from "../ConstructorContext";
import {ParseMeta} from "../../../types/ParseMeta";

export interface EffectParamsTrackProps {
    effect: PlixEffectJsonData,
    path: EditorPath,
    skipParams?: number,
}
export const EffectParamsTrack: FC<EffectParamsTrackProps> = memo(({effect, path, skipParams=0}) => {
    const {effectConstructorMap} = useContext(ConstructorContext);
    interface EffectParamDescription {
        name: string,
        type: string,
        description: string,
        value: any,
        clearAction: MultiActionType,
        path: EditorPath
    }
    const paramsDescriptions = useMemo(() => {
        if (!effect) return null;
        const paramsDescriptions: EffectParamDescription[] = [];
        const [,effectId, params, filters] = effect;
        if (effectId) {
            const effectConstructor = effectConstructorMap[effectId];
            const meta: ParseMeta = effectConstructor['meta'];
            for (let i = 0; i < meta.paramNames.length; i++) {
                if (i < skipParams) continue;
                const paramName = meta.paramNames[i];
                const defaultValue = meta.defaultValues[i];
                const propPath = [...path, 2, i];
                paramsDescriptions.push({
                    name: paramName,
                    type: meta.paramTypes[i],
                    description: meta.paramDescriptions[i],
                    value: params[i],
                    clearAction: EditValueAction(propPath, defaultValue),
                    path: propPath,
                });
            }
        }
        const filtersPath = [...path, 3];
        paramsDescriptions.push({
            name: "Filters",
            type: "array:filter",
            description: "filters applied to effect",
            value: filters ?? [],
            clearAction: EditValueAction(filtersPath, []),
            path: filtersPath,
        })
        return paramsDescriptions
    }, [effect, path, effectConstructorMap]);

    if (!paramsDescriptions) return null;

    return (
        <Track>
            {null}
            {null}
            {paramsDescriptions.map(({name, type, value, path, description,clearAction}) => (
                <ValueTrack value={value} type={type} path={path} key={name} description={description} clearAction={clearAction} title={description}>
                    {name}
                </ValueTrack>
            ))}
        </Track>
    );
});