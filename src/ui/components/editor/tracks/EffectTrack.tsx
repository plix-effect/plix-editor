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
import {ContainerEffectTrack} from "./ContainerEffectTrack";
import {
    EditValueAction,
    InsertValuesAction,
    MultiAction,
    MultiActionType,
    PushValueAction
} from "../PlixEditorReducerActions";
import {EffectTypeTrack} from "./EffectTypeTrack";
import {EffectPreview} from "./editor/EffectPreview";
import {InlineEffectTypeEditor} from "./editor/inline/InlineEffectTypeEditor";
import {DragType} from "../DragContext";
import {TreeBlockEffect} from "./editor/TreeBlockEffect";
import {isObjectEqualOrContains} from "../../../utils/isObjectContains";
import {ConstructorContext} from "../ConstructorContext";
import {useEffectClass} from "../../../use/useEffectClass";
import {PlixFilterJsonData} from "@plix-effect/core/dist/types/parser";

export interface EffectTrackProps {
    path: EditorPath,
    baseExpanded?: boolean,
    children: ReactNode,
    alias?: string,
    effect: PlixEffectJsonData,
    deleteAction?: MultiActionType,
    clearAction?: MultiActionType,
    onDragOverItem?: (event: DragEvent<HTMLElement>, value: DragType) => void | [string, DragEventHandler]
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

    const {effectConstructorMap} = useContext(ConstructorContext);
    const effectClass = useEffectClass(effect);

    const onDragOverItemSelf = useCallback((event: DragEvent<HTMLElement>, dragData: DragType): void | [string, DragEventHandler] => {
        const originDragHandler = onDragOverItem?.(event, dragData);
        if (originDragHandler) return originDragHandler;
        if (!dragData) return;

        const allowFilters = effect !== null;

        let mode: "copy"|"move"|"link"|"none" = "copy";
        if (event.ctrlKey && event.shiftKey) mode = "link";
        else if (event.ctrlKey) mode = "copy";
        else if (event.shiftKey) mode = dragData.deleteAction ? "move" : "none";
        else if (dragData.effectLink !== undefined) mode = "link";
        else if (dragData.effect !== undefined) mode = "copy";
        else if (allowFilters && dragData.filterLink !== undefined) mode = "link";
        else if (allowFilters && dragData.filter !== undefined) mode = "copy";

        if (mode === "none") return;

        let valueEffects: PlixEffectJsonData[];
        let valueFilters: PlixFilterJsonData[];

        if (mode !== "link"){
            const typedValue = dragData.typedValue;
            if (dragData.effect !== undefined) valueEffects = [dragData.effect];
            if (allowFilters && dragData.filter !== undefined) valueFilters = [dragData.filter];
            if (!valueEffects) {
                if (typedValue && typedValue.type === "array:effect" && typedValue.value.length > 0) {
                    valueEffects = typedValue.value;
                }
            }
            if (allowFilters && !valueFilters) {
                if (typedValue && typedValue.type === "array:filter" && typedValue.value.length > 0) {
                    valueFilters = typedValue.value;
                }
            }
        } else {
            if (dragData.effectLink !== undefined) valueEffects = [dragData.effectLink];
            if (allowFilters && dragData.filterLink !== undefined) valueFilters = [dragData.filterLink];
        }
        if (valueEffects === undefined && valueFilters === undefined) return;

        let action: "add-effects"|"add-filters"|"change"|"change-filters";
        if (valueEffects) {
            if (effectClass === "container") {
                action = (event.altKey && valueEffects.length === 1) ? "change" : "add-effects";
            } else {
                action = "change"
            }
        } else if (valueFilters) {
            action = event.altKey ? "change-filters" : "add-filters";
        }
        if (!action) return;

        dragData.dropEffect = mode;

        if (action === "change" && effect === valueEffects[0]) return;
        if (mode === "move") {
            if (isObjectEqualOrContains(valueEffects, effect)) return;
        }
        if (action === "change" && mode === "link" && valueEffects && valueEffects[0]?.[2] === alias) return;

        const dropClass = (action === "change" || action === "change-filters") ? "_drop-replace" : "_drop-add-item";

        return [dropClass, () => {
            let changeAction;
            if (action === "add-effects") {
                const innerEffects = effect?.[2]?.[0] ?? [];
                changeAction = InsertValuesAction([...path, 2, 0], innerEffects.length, valueEffects);
            } else if (action === "add-filters") {
                const innerFilters = effect?.[3] ?? [];
                changeAction = InsertValuesAction([...path, 3], innerFilters.length, valueFilters);
            } else if (action === "change-filters") {
                changeAction = EditValueAction([...path, 3], valueFilters);
            } else if (action === "change") {
                const valueEffect = valueEffects[0];
                if (mode === "link" && effect !== null && valueEffect !== null) { // save filters on drop effect as link
                    const innerFilters = effect?.[3] ?? [];
                    const enabled = !effect || effect[0];
                    changeAction = EditValueAction(path, [enabled, null, valueEffect[2], innerFilters]);
                } else {
                    changeAction = EditValueAction(path, valueEffect);
                }
            } else {
                return;
            }
            if (mode === "move" && dragData.deleteAction) {
                dispatch(MultiAction([changeAction, dragData.deleteAction]))
            } else { // action === "copy" || action === "link"
                dispatch(changeAction);
            }
        }];
    }, [onDragOverItem, path, dispatch, effect]);

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
    if (effectClass === "timeline") return (
        <TimelineEffectTrack
            effect={effect as PlixEffectConfigurableJsonData}
            onChange={onChangeEffect}
            path={path}
            expanded={expanded}
            leftBlock={leftBlock}
        />
    );
    if (effectClass === "container") return (
        <ContainerEffectTrack
            effect={effect as PlixEffectConfigurableJsonData}
            path={path}
            expanded={expanded}
            onChange={onChangeEffect}
            leftBlock={leftBlock}
        />
    );
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
    const valueFilters = useMemo(() => filters ?? [], [filters]);

    const clearFilters = useMemo(() => {
        return EditValueAction([...path, 3], []);
    }, [path]);

    return (
        <Track nested expanded={expanded} >
            {leftBlock}
            <TimelineBlock fixed>
                <span className="track-description _desc">
                    <InlineEffectTypeEditor onChange={onChange} effect={effect} />
                </span>
            </TimelineBlock>

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
    const {effectConstructorMap} = useContext(ConstructorContext);
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
                    <InlineEffectTypeEditor onChange={onChange} effect={effect} />
                </span>
            </TimelineBlock>

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
