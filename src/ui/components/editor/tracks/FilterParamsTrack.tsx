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

export interface FilterParamsTrackProps {
    filter: PlixEffectJsonData,
    path: EditorPath,
    skipParams?: number,
}
export const FilterParamsTrack: FC<FilterParamsTrackProps> = memo(({filter, path, skipParams=0}) => {
    const {filterConstructorMap} = useContext(ConstructorContext);
    interface EffectParamDescription {
        name: string,
        type: string,
        description: string,
        value: any,
        clearAction: MultiActionType,
        path: EditorPath
    }
    const paramsDescriptions = useMemo(() => {
        if (!filter) return null;
        const paramsDescriptions: EffectParamDescription[] = [];
        const [,filterId, params, filters] = filter;
        if (filterId) {
            const filterConstructor = filterConstructorMap[filterId];
            const meta: ParseMeta = filterConstructor['meta'];
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
        return paramsDescriptions
    }, [filter, path, filterConstructorMap]);

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