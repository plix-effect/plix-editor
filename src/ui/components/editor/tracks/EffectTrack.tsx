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
    clearAction?: MultiActionType,
    onDragOverItem?: (event: DragEvent<HTMLElement>, value: DragType) => void | DragEventHandler
}
export const EffectTrack: FC<EffectTrackProps> = memo(({effect, path, baseExpanded, children, alias, deleteAction, clearAction, onDragOverItem}) => {
    const [expanded, expander, changeExpanded, setExpanded] = useExpander(baseExpanded);

    const dragValue: DragType = useMemo<DragType>(() => {
        return {
            typedValue: {type: "effect", value: effect},
            effect: effect,
            effectLink: alias && [true, null, alias, []],
            deleteAction: deleteAction
        }
    }, [effect, alias, deleteAction]);

    const {dispatch} = useContext(TrackContext);

    const onDragOverItemSelf = useCallback((event: DragEvent<HTMLElement>, dragData: DragType): void | DragEventHandler => {
        const originDragHandler = onDragOverItem?.(event, dragData);
        if (originDragHandler) return originDragHandler;
        if (!dragData) return;

        let mode: "copy"|"move"|"link"|"none" = "none";
        if (event.ctrlKey && event.shiftKey) mode = "link";
        else if (event.ctrlKey) mode = "copy";
        else if (event.shiftKey) mode = dragData.deleteAction ? "move" : "none";
        else if (dragData.effectLink !== undefined) mode = "link";
        else if (dragData.effect !== undefined) mode = "copy";

        if (mode === "none") return void (dragData.dropEffect = "none");

        let valueEffect: PlixEffectJsonData;

        if (dragData.effect && mode !== "link") {
            valueEffect = dragData.effect;
        }

        if (valueEffect === undefined && dragData.effectLink && mode === "link") {
            valueEffect = dragData.effectLink;
        }
        if (valueEffect === undefined) return void (dragData.dropEffect = "none");
        dragData.dropEffect = mode;

        if (effect === valueEffect) return void (dragData.dropEffect = "none");
        if (mode === "move") {
            if (isObjectEqualOrContains(valueEffect, effect)) return void (dragData.dropEffect = "none");
        }
        if (mode === "link" && valueEffect[2] === alias) return void (dragData.dropEffect = "none");
        return () => {
            let changeAction;
            if (mode === "link" && effect !== null && valueEffect !== null) { // save filters on paste as link
                changeAction = EditValueAction(path, [true, null, valueEffect[2], effect[3]]);
            } else {
                changeAction = EditValueAction(path, valueEffect);
            }
            if (mode === "move" && dragData.deleteAction) {
                dispatch(MultiAction([changeAction, dragData.deleteAction]))
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
            setExpanded={setExpanded}
            expander={expander}
            path={path}
            deleteAction={deleteAction}
            clearAction={clearAction}
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

    const clearFilters = useMemo(() => {
        return EditValueAction([...path, 3], []);
    }, [path]);

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

            <ValueTrack value={valueFilters} type={"array:filter"} path={filtersPath} description="filters applied to effect" clearAction={clearFilters}>
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
        const paramDescriptions = meta.paramNames.map((paramName, i) => {
            const defaultValue = meta.defaultValues[i];
            return ({
                name: paramName,
                type: meta.paramTypes[i],
                description: meta.paramDescriptions[i],
                value: params[i],
                clearAction: EditValueAction([...path, 2, i], defaultValue),
                path: [...path, 2, i],
            })
        })
        return {
            name: meta.name,
            description: meta.description,
            paramDescriptions: paramDescriptions
        }
    }, [effectId, params]);
    const filtersPath = useMemo(() => [...path, 3], [path]);
    const valueFilters = useMemo(() => filters ?? [], [filters]);

    const clearFilters = useMemo(() => {
        return EditValueAction([...path, 3], []);
    }, [path]);

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
                <ValueTrack value={paramDesc.value} type={paramDesc.type} path={paramDesc.path} key={paramDesc.name} description={paramDesc.description} clearAction={paramDesc.clearAction}>
                    {paramDesc.name}
                </ValueTrack>
            ))}
            <ValueTrack value={valueFilters} type={"array:filter"} path={filtersPath} description="filters applied to effect" clearAction={clearFilters}>
                Filters
            </ValueTrack>
        </Track>
    )
}
