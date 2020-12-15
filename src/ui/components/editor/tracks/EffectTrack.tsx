import React, {DragEvent, DragEventHandler, FC, memo, ReactNode, useCallback, useContext, useMemo} from "react";
import {Track} from "../../timeline/Track";
import type {
    PlixEffectConfigurableJsonData,
    PlixEffectJsonData
} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {TrackContext} from "../TrackContext";
import {ParseMeta} from "../../../types/ParseMeta";

import "./tracks.scss"
import {useExpander} from "../track-elements/Expander";
import {TimelineEffectTrack} from "./TimelineEffectTrack";
import {ContainerEffectTrack} from "./ContainerEffectTrack";
import {
    EditValueAction,
    InsertValuesAction,
    MultiAction,
    MultiActionType,
} from "../PlixEditorReducerActions";
import {InlineEffectTypeEditor} from "./editor/inline/InlineEffectTypeEditor";
import {DragType} from "../DragContext";
import {TreeBlockEffect} from "./editor/TreeBlockEffect";
import {isObjectEqualOrContains} from "../../../utils/isObjectContains";
import {ConstructorContext} from "../ConstructorContext";
import {useEffectClass} from "../../../use/useEffectClass";
import {PlixFilterJsonData} from "@plix-effect/core/dist/types/parser";
import {EffectParamsTrack} from "./EffectParamsTrack";
import {RenameTrack} from "./RenameTrack";
import {CanvasStaticEffectPreview} from "../../preview/canvas/static/CanvasStaticEffectPreview";
import {InlineEffectPreview} from "./editor/inline/InlineEffectPreview";

export interface EffectTrackProps {
    path: EditorPath,
    baseExpanded?: boolean,
    children: ReactNode,
    effect: PlixEffectJsonData,
    title?: string,
    alias?: string,
    deleteAction?: MultiActionType,
    clearAction?: MultiActionType,
    onDragOverItem?: (event: DragEvent<HTMLElement>, value: DragType) => void | [string, DragEventHandler]
    overrideValue?: PlixEffectJsonData
}
export const EffectTrack: FC<EffectTrackProps> = memo(({effect, path, title, baseExpanded, children, alias, deleteAction, clearAction, onDragOverItem, overrideValue}) => {
    const [expanded, expander, changeExpanded, setExpanded] = useExpander(baseExpanded);

    const dragValue: DragType = useMemo<DragType>(() => {
        const dragEffect = effect === undefined ? overrideValue : effect;
        return {
            typedValue: {type: "effect", value: dragEffect},
            effect: dragEffect,
            effectLink: alias && [true, null, alias, []],
            deleteAction: deleteAction
        }
    }, [effect, alias, deleteAction, overrideValue]);

    const {dispatch} = useContext(TrackContext);

    const {effectConstructorMap} = useContext(ConstructorContext);
    const effectClass = useEffectClass(effect);
    const {track} = useContext(TrackContext); // todo оптимизировать, не дёргать track

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
            overrideValue={overrideValue}
            changeExpanded={changeExpanded}
            setExpanded={setExpanded}
            expander={expander}
            path={path}
            title={title}
            deleteAction={deleteAction}
            clearAction={clearAction}
            dragValue={dragValue}
            onDragOverItem={onDragOverItemSelf}
        > {children} </TreeBlockEffect>
    )

    if (effect === undefined && overrideValue !== undefined) return (
        <OverrideEffectTrack
            path={path}
            expanded={expanded}
            leftBlock={leftBlock}
            overrideValue={overrideValue}
            alias={alias}
        >{children}</OverrideEffectTrack>
    );
    if (effectClass === "timeline") return (
        <TimelineEffectTrack
            effect={effect as PlixEffectConfigurableJsonData}
            alias={alias}
            onChange={onChangeEffect}
            path={path}
            expanded={expanded}
            leftBlock={leftBlock}
        />
    );
    if (effectClass === "container") return (
        <ContainerEffectTrack
            effect={effect as PlixEffectConfigurableJsonData}
            alias={alias}
            path={path}
            expanded={expanded}
            onChange={onChangeEffect}
            leftBlock={leftBlock}
        />
    );
    return (
        <Track nested expanded={expanded}>
            {leftBlock}
            <TimelineBlock fixed>
                <span className="track-description _desc">
                    <InlineEffectTypeEditor onChange={onChangeEffect} effect={effect} />
                </span>
                <InlineEffectPreview effect={effect}/>
            </TimelineBlock>

            {alias != null && (<RenameTrack value={alias} type={"effect"}/>)}

            <EffectParamsTrack effect={effect} path={path}/>
        </Track>
    );
})


export interface OverrideEffectTrackProps {
    path: EditorPath,
    overrideValue: PlixEffectJsonData,
    expanded: boolean,
    leftBlock: ReactNode,
    alias?: string
}
const OverrideEffectTrack: FC<OverrideEffectTrackProps> = memo(({path, alias, expanded, leftBlock, overrideValue}) => {
    const {dispatch} = useContext(TrackContext);
    const override = useCallback(() => {
        dispatch(EditValueAction(path, overrideValue))
    }, [overrideValue, path, dispatch])

    return (
        <Track nested expanded={expanded}>
            {leftBlock}
            <TimelineBlock fixed>
                <button onClick={override}>override effect</button>
            </TimelineBlock>

            {alias != null && (<RenameTrack value={alias} type={"effect"}/>)}
        </Track>
    );
});