import React, {FC, memo, ReactNode, useCallback, useContext, useMemo} from "react";
import {Track} from "../../timeline/Track";
import {
    PlixEffectAliasJsonData,
    PlixEffectConfigurableJsonData,
    PlixEffectJsonData
} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {TrackContext} from "../TrackContext";
import {ParseMeta} from "../../../types/ParseMeta";
import {ValueTrack} from "./ValueTrack";

import "./tracks.scss"
import {useExpander} from "../track-elements/Expander";
import {getArrayKey} from "../../../utils/KeyManager";
import {TimelineEffectTrack} from "./TimelineEffectTrack";
import {ChainEffectTrack} from "./ChainEffectTrack";
import {EffectTypeEditor} from "./editor/EffectTypeEditor";
import {EditValueAction} from "../PlixEditorReducerActions";
import {EffectTypeTrack} from "./EffectTypeTrack";
import {DraggableEffect} from "./editor/DraggableEffect";

export interface EffectTrackProps {
    effect: PlixEffectJsonData,
    path: EditorPath,
    baseExpanded?: boolean,
    children: ReactNode,
}
export const EffectTrack: FC<EffectTrackProps> = memo(({effect, path, baseExpanded, children}) => {
    const [expanded, expander, changeExpanded] = useExpander(baseExpanded);

    const {effectConstructorMap} = useContext(TrackContext);
    const {dispatch} = useContext(TrackContext);
    const onChangeEffect = useCallback((type: null|"alias"|"constructor", value?: string) => {
        if (!type) {
            return dispatch(EditValueAction(path, null));
        }
        const templateEffect = effect ? effect.slice(0) : [true, null, [], []];
        if (type === "alias") {
            templateEffect[1] = null;
            templateEffect[2] = value;
        } else if (type === "constructor") {
            templateEffect[1] = value;
            const effectConstructor = effectConstructorMap[value];
            const meta: ParseMeta = effectConstructor['meta'];
            templateEffect[2] = meta.defaultValues;
        }
        return dispatch(EditValueAction(path, templateEffect));
    }, [effect, dispatch]);

    if (!effect) return (
        <NoEffectTrack
            onChange={onChangeEffect}
            path={path}
            expanded={expanded}
            expander={expander}
            changeExpanded={changeExpanded}
        >{children}</NoEffectTrack>
    )
    if (effect[1] === null) return (
        <AliasEffectTrack
            path={path}
            onChange={onChangeEffect}
            expanded={expanded}
            expander={expander}
            changeExpanded={changeExpanded}
            effect={effect as PlixEffectAliasJsonData}
            children={children}
        />
    );
    if (effect[1] === "Timeline") return (
        <TimelineEffectTrack
            effect={effect as PlixEffectConfigurableJsonData}
            onChange={onChangeEffect}
            path={path}
            children={children}
            expanded={expanded}
            expander={expander}
            changeExpanded={changeExpanded}
        />
    )
    if (effect[1] === "Chain") return (
        <ChainEffectTrack
            effect={effect as PlixEffectConfigurableJsonData}
            path={path}
            children={children}
            expanded={expanded}
            expander={expander}
            onChange={onChangeEffect}
            changeExpanded={changeExpanded}
        />
    )
    return (
        <ConfigurableEffectTrack
            path={path}
            onChange={onChangeEffect}
            expanded={expanded}
            expander={expander}
            changeExpanded={changeExpanded}
            effect={effect as PlixEffectConfigurableJsonData}
            children={children}
        />
    )
})

////////////////////////////////////////////////////////////

export interface NoEffectTrackProps {
    path: EditorPath,
    children: ReactNode,
    onChange: (type: null|"alias"|"constructor", value?: string) => void,
    changeExpanded: () => void,
    expanded: boolean,
    expander: ReactNode;
}
const NoEffectTrack: FC<NoEffectTrackProps> = memo(({children, onChange, expanded, expander, changeExpanded}) => {
    return (
        <Track nested expanded={expanded}>
            <TreeBlock>
                {expander}
                <span className="track-description" onClick={changeExpanded}>{children}</span>
                {" "}
                <span className="track-description _empty">empty</span>
            </TreeBlock>
            <TimelineBlock fixed>
                <EffectTypeEditor onChange={onChange} effect={null} />
            </TimelineBlock>
        </Track>
    );
});

interface AliasEffectTrackProps {
    effect: PlixEffectAliasJsonData
    path: EditorPath,
    children: ReactNode,
    changeExpanded: () => void,
    expanded: boolean,
    expander: ReactNode;
    onChange: (type: null|"alias"|"constructor", value?: string) => void,
}
const AliasEffectTrack: FC<AliasEffectTrackProps> = ({effect, effect: [enabled ,, link, filters], path, children, changeExpanded, expanded, expander, onChange}) => {
    const filtersPath = useMemo(() => [...path, 3], [path]);
    const valueFilters = useMemo(() => filters ?? [], [filters]);
    return (
        <Track nested expanded={expanded}>
            <TreeBlock>
                {expander}
                <span className="track-description" onClick={changeExpanded}>{children}</span>
                {" "}
                <DraggableEffect effect={effect} path={path}/>
            </TreeBlock>
            <TimelineBlock fixed>
                <span className="track-description _desc">
                    use alias <span className="track-description _link">{link}</span>
                </span>
            </TimelineBlock>

            <EffectTypeTrack onChange={onChange} effect={effect} />

            <ValueTrack value={valueFilters} type={"array:filter"} path={filtersPath} description="filters applied to effect">
                Filters
            </ValueTrack>
        </Track>
    )
}

interface ConfigurableEffectTrackProps {

    effect: PlixEffectConfigurableJsonData
    path: EditorPath,
    children: ReactNode,
    expanded: boolean,
    changeExpanded: () => void,
    expander: ReactNode;
    onChange: (type: null|"alias"|"constructor", value?: string) => void,
}
const ConfigurableEffectTrack: FC<ConfigurableEffectTrackProps> = ({onChange, effect, effect: [enabled, effectId, params, filters], children, changeExpanded, path, expanded, expander}) => {
    const {effectConstructorMap} = useContext(TrackContext);
    const effectData = useMemo(() => {
        const effectConstructor = effectConstructorMap[effectId];
        const meta: ParseMeta = effectConstructor['meta'];
        const paramDescriptions = meta.paramNames.map((paramName, i) => ({
            name: paramName,
            type: meta.paramTypes[i],
            description: meta.paramDescriptions[i],
            value: params[i],
            path: [...path, 2, {key: getArrayKey(params, i), array: params}]
        }))
        return {
            name: meta.name,
            description: meta.description,
            paramDescriptions: paramDescriptions
        }
    }, [effectId, params]);
    const filtersPath = useMemo(() => [...path, 3], [path]);
    const valueFilters = useMemo(() => filters ?? [], [filters]);
    return (
        <Track nested expanded={expanded}>
            <TreeBlock>
                {expander}
                <span className="track-description" onClick={changeExpanded}>{children}</span>
                {" "}
                <DraggableEffect effect={effect} path={path}/>
            </TreeBlock>
            <TimelineBlock fixed>
                <span className="track-description _desc">
                    {effectData.description}
                </span>
            </TimelineBlock>

            <EffectTypeTrack onChange={onChange} effect={effect} />

            {effectData.paramDescriptions.map((paramDesc) => (
                <ValueTrack value={paramDesc.value} type={paramDesc.type} path={paramDesc.path} key={paramDesc.name} description={paramDesc.description}>
                    {paramDesc.name}
                </ValueTrack>
            ))}
            <ValueTrack value={valueFilters} type={"array:filter"} path={filtersPath} description="filters applied to effect">
                Filters
            </ValueTrack>
        </Track>
    )
}
