import React, {DragEvent, DragEventHandler, FC, memo, ReactNode, useCallback, useContext, useMemo} from "react";
import {Track} from "../../timeline/Track";
import type {
    PlixEffectAliasJsonData,
    PlixEffectConfigurableJsonData,
    PlixEffectJsonData
} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {TrackContext} from "../TrackContext";
import {ParseMeta} from "../../../types/ParseMeta";
import {ValueTrack} from "./ValueTrack";

import "./tracks.scss"
import {useExpander} from "../track-elements/Expander";
import {getArrayKey} from "../../../utils/KeyManager";
import {TimelineEffectTrack} from "./TimelineEffectTrack";
import {ChainEffectTrack} from "./ChainEffectTrack";
import {EditValueAction, MultiAction, MultiActionType} from "../PlixEditorReducerActions";
import {EffectTypeTrack} from "./EffectTypeTrack";
import {EffectPreview} from "./editor/EffectPreview";
import {InlineEffectTypeEditor} from "./editor/inline/InlineEffectTypeEditor";
import {DragType} from "../DragContext";
import {TreeBlockEffect} from "./editor/TreeBlockEffect";
import {isObjectEqualOrContains} from "../../../utils/isObjectContains";

export interface EffectTrackProps {
    path: EditorPath,
    baseExpanded?: boolean,
    children: ReactNode,
    alias?: string,
    effect: PlixEffectJsonData,
    deleteAction?: MultiActionType,
    onDragOverItem?: (event: DragEvent<HTMLElement>, value: DragType) => void | DragEventHandler
}
export const EffectTrack: FC<EffectTrackProps> = memo(({effect, path, baseExpanded, children, alias, deleteAction, onDragOverItem}) => {
    const [expanded, expander, changeExpanded] = useExpander(baseExpanded);

    const dragValue: DragType = useMemo<DragType>(() => {
        return {
            typedValue: {type: "effect", value: effect},
            effect: effect,
            effectLink: alias && [true, null, alias, []],
            deleteAction: deleteAction
        }
    }, [effect, alias]);

    const {dispatch} = useContext(TrackContext);

    const onDragOverItemSelf = useCallback((event: DragEvent<HTMLElement>, value: DragType): void | DragEventHandler => {
        const originDragHandler = onDragOverItem?.(event, value);
        if (originDragHandler) return originDragHandler;
        if (!value) return;

        let mode: "copy"|"move"|"link"|"none" = "none";
        if (event.ctrlKey && event.shiftKey) mode = "link";
        else if (event.ctrlKey) mode = "copy";
        else if (event.shiftKey) mode = value.deleteAction ? "move" : "none";
        else if (value.effectLink) mode = "link";
        else if (value.effect) mode = "copy";

        if (mode === "none") return void (value.dropEffect = "none");

        let valueEffect: PlixEffectJsonData;

        if (value.effect && mode !== "link") {
            valueEffect = value.effect;
        }

        if (!valueEffect && value.effectLink && mode === "link") {
            valueEffect = value.effectLink;
        }
        if (!valueEffect) return void (value.dropEffect = "none");
        value.dropEffect = mode;

        if (effect === valueEffect) return void (value.dropEffect = "none");
        if (mode === "move") {
            if (isObjectEqualOrContains(effect, valueEffect)) return void (value.dropEffect = "none");
        }
        return () => {
            let changeAction;
            if (mode === "link" && effect !== null && valueEffect !== null) { // save filters on paste as link
                changeAction = EditValueAction(path, [true, null, valueEffect[2], effect[3]]);
            } else {
                changeAction = EditValueAction(path, valueEffect);
            }
            if (mode === "move" && value.deleteAction) {
                dispatch(MultiAction([changeAction, value.deleteAction]))
            } else { // action === "copy" || action === "link"
                dispatch(changeAction);
            }
        };
    }, [onDragOverItem, path, dispatch]);

    const {effectConstructorMap} = useContext(TrackContext);
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

    const leftBlock = (
        <TreeBlockEffect
            effect={effect}
            changeExpanded={changeExpanded}
            expander={expander}
            path={path}
            deleteAction={deleteAction}
            dragValue={dragValue}
            onDragOverItem={onDragOverItemSelf}
        > {children} </TreeBlockEffect>
    )

    if (!effect) return (
        <NoEffectTrack
            onChange={onChangeEffect}
            expanded={expanded}
            leftBlock={leftBlock}
        >{children}</NoEffectTrack>
    )
    if (effect[1] === null) return (
        <AliasEffectTrack
            path={path}
            onChange={onChangeEffect}
            expanded={expanded}
            effect={effect as PlixEffectAliasJsonData}
            children={children}
            leftBlock={leftBlock}
        />
    );
    if (effect[1] === "Timeline") return (
        <TimelineEffectTrack
            effect={effect as PlixEffectConfigurableJsonData}
            onChange={onChangeEffect}
            path={path}
            expanded={expanded}
            leftBlock={leftBlock}
        />
    )
    if (effect[1] === "Chain") return (
        <ChainEffectTrack
            effect={effect as PlixEffectConfigurableJsonData}
            path={path}
            expanded={expanded}
            onChange={onChangeEffect}
            leftBlock={leftBlock}
        />
    )
    return (
        <ConfigurableEffectTrack
            path={path}
            onChange={onChangeEffect}
            expanded={expanded}
            effect={effect as PlixEffectConfigurableJsonData}
            children={children}
            leftBlock={leftBlock}
        />
    );
})

////////////////////////////////////////////////////////////

export interface NoEffectTrackProps {
    onChange: (type: null|"alias"|"constructor", value?: string) => void,
    expanded: boolean,
    leftBlock: ReactNode;
}
const NoEffectTrack: FC<NoEffectTrackProps> = memo(({onChange, expanded, leftBlock}) => {
    return (
        <Track nested expanded={expanded}>
            {leftBlock}
            <TimelineBlock fixed>
                <InlineEffectTypeEditor onChange={onChange} effect={null} />
            </TimelineBlock>
        </Track>
    );
});

interface AliasEffectTrackProps {
    effect: PlixEffectAliasJsonData
    path: EditorPath,
    expanded: boolean,
    onChange: (type: null|"alias"|"constructor", value?: string) => void,
    leftBlock: ReactNode;
}
const AliasEffectTrack: FC<AliasEffectTrackProps> = ({effect, leftBlock, effect: [enabled ,, link, filters], path,  expanded, onChange}) => {
    const filtersPath = useMemo(() => [...path, 3], [path]);
    const effectWithNoFilters: PlixEffectAliasJsonData = useMemo(() => [enabled, null, link, []], [effect])
    const valueFilters = useMemo(() => filters ?? [], [filters]);

    return (
        <Track nested expanded={expanded} >
            {leftBlock}
            <TimelineBlock fixed>
                <span className="track-description _desc">
                    {filters?.length >= 0 && (
                        <>
                            <EffectPreview effect={effectWithNoFilters} />
                            -&gt;
                        </>
                    )}
                    <EffectPreview effect={effect} /> use alias <span className="track-description _link">{link}</span>
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
    expanded: boolean,
    onChange: (type: null|"alias"|"constructor", value?: string) => void,
    leftBlock?: ReactNode
}
const ConfigurableEffectTrack: FC<ConfigurableEffectTrackProps> = ({onChange, leftBlock, effect, effect: [enabled, effectId, params, filters], children, path, expanded}) => {
    const {effectConstructorMap} = useContext(TrackContext);
    const effectWithNoFilters: PlixEffectConfigurableJsonData = useMemo(() => [enabled, effectId, params, []], [effect])
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
            {leftBlock}
            <TimelineBlock fixed>
                <span className="track-description _desc">
                    {filters?.length >= 0 && (
                        <>
                            <EffectPreview effect={effectWithNoFilters} />
                            -&gt;
                        </>
                    )}
                    <EffectPreview effect={effect} />
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
