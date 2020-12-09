import React, {
    DragEventHandler,
    Fragment,
    memo,
    MouseEventHandler,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import type {DragEvent} from "react";
import {ScaleDisplayContext} from "../../../ScaleDisplayContext";
import "../TimelineEditor.scss";
import {PlixTimeEffectRecordJsonData} from "@plix-effect/core/dist/parser/parseTimeEffectRecord";
import {DragContext, DragType} from "../../../DragContext";
import {TrackContext} from "../../../TrackContext";
import {
    DeleteAction,
    EditValueAction,
    InsertIndexAction,
    MultiAction, MultiActionType,
    PushValueAction
} from "../../../PlixEditorReducerActions";
import {EditorPath} from "../../../../../types/Editor";
import {TIMELINE_LCM} from "@plix-effect/core";
import {getArrayKey} from "../../../../../utils/KeyManager";
import {PlixEffectJsonData} from "@plix-effect/core/types/parser";
import {ConstructorContext} from "../../../ConstructorContext";
import {ParseMeta} from "../../../../../types/ParseMeta";

type PositionM = [startM: number, endM: number];

export interface TimelineEditorRecordGroupProps {
    recordsGroup: PlixTimeEffectRecordJsonData[]|null,
    setRecordsGroup: (records: PlixTimeEffectRecordJsonData[]|null) => void,
    children: ReactNode;
    offset: number;
    bpm: number;
    grid: number;
    repeatStart: number;
    repeatEnd: number;
    records: PlixTimeEffectRecordJsonData[],
    path: EditorPath,
}

export const TimelineEditorRecordGroup = memo<TimelineEditorRecordGroupProps>(({recordsGroup, records, path, setRecordsGroup, children, offset, bpm, grid, repeatStart, repeatEnd}) => {
    const wrapperRef = useRef<HTMLDivElement>();
    const groupBgRef = useRef<HTMLDivElement>();
    const {duration} = useContext(ScaleDisplayContext);
    const {dispatch} = useContext(TrackContext);
    const {effectConstructorMap} = useContext(ConstructorContext);
    const cycle = 60000 / bpm;

    useEffect(() => {
        let startD = -1;
        let durationD = 0;
        if (recordsGroup && recordsGroup.length > 0) {
            const startM = recordsGroup[0][2];
            const endM = recordsGroup[recordsGroup.length-1][3];
            startD = (offset + startM * cycle / TIMELINE_LCM) / duration;
            durationD = (endM - startM) * cycle / TIMELINE_LCM / duration;
        }
        groupBgRef.current.style.left = `${startD * 100}%`;
        groupBgRef.current.style.width = `${durationD * 100}%`;
    }, [recordsGroup, offset, cycle, duration]);

    const deleteAction = useMemo<null|MultiActionType>(() => {
        if (!recordsGroup) return null;
        const deleteActions = recordsGroup.map(record => {
            const key = getArrayKey(records, records.indexOf(record));
            return DeleteAction([...path, {key}]);
        });
        return MultiAction(deleteActions);
    }, [recordsGroup, records, path]);

    const onClick: MouseEventHandler<HTMLDivElement> = useCallback(({ctrlKey, shiftKey, altKey}) => {
        if (!ctrlKey && !shiftKey && !altKey) return setRecordsGroup(null);
        if (!ctrlKey && !shiftKey && altKey) return deleteAction && dispatch(deleteAction);
    }, [dispatch, deleteAction]);

    const dragValue = useMemo<DragType>(() => {
        if (!recordsGroup) return null;
        let effect: PlixEffectJsonData;
        const timelineConstructor = effectConstructorMap["Timeline"];
        if (timelineConstructor) {
            const meta: ParseMeta = timelineConstructor['meta'];
            const paramPreset = [recordsGroup, bpm, grid, offset, repeatStart, repeatEnd];
            const effectParams = meta.defaultValues.map((value, i) => {
                if (i < paramPreset.length) return paramPreset[i];
                return value;
            })
            effect = [true, "Timeline", effectParams, []]
        }
        return {
            recordsMove: {
                records: recordsGroup,
                offset: offset,
                bpm: bpm
            },
            deleteAction,
            effect: effect,
        }
    }, [recordsGroup, deleteAction])

    const dragRef = useContext(DragContext);

    const onDragStart: DragEventHandler<HTMLDivElement> = useCallback((event) => {
        if (!dragValue) return;
        dragRef.current = {
            ...dragValue,
            offsetX: event.nativeEvent.offsetX,
            offsetY: event.nativeEvent.offsetY,
        }
        localStorage.setItem("plix_editor_drag", JSON.stringify(dragRef.current));
        event.dataTransfer.setData("plix/localstorage", "");
        groupBgRef.current.classList.add("_drag");
        wrapperRef.current.classList.add("_drag");
        event.stopPropagation();
        event.dataTransfer.setDragImage(new Image(), 0, 0);
    }, [dragValue, groupBgRef, wrapperRef]);

    const onDrag = useCallback(() => {
        const dropEffect = dragRef.current?.dropEffect
        groupBgRef.current.classList.remove("_move", "_copy", "_link", "_none");
        wrapperRef.current.classList.remove("_move", "_copy", "_link", "_none");
        if (dropEffect) {
            wrapperRef.current.classList.add(`_${dropEffect}`);
            groupBgRef.current.classList.add(`_${dropEffect}`);
        }
    }, [dragRef, groupBgRef, wrapperRef]);

    const onDragStartLeft = useCallback((event: DragEvent<HTMLDivElement>) => {
        dragRef.current = {
            recordsScale: {records: recordsGroup, side: "left"},
            offsetX: event.nativeEvent.offsetX,
            offsetY: event.nativeEvent.offsetY,
        };
        event.dataTransfer.setDragImage(new Image(), 0, 0);
        event.dataTransfer.effectAllowed = 'move';
        groupBgRef.current.classList.add("_drag", "_move");
        wrapperRef.current.classList.add("_drag", "_move");
    }, [recordsGroup]);

    const onDragStartRight = useCallback((event: DragEvent<HTMLDivElement>) => {
        dragRef.current = {
            recordsScale: {records: recordsGroup, side: "right"},
            offsetX: event.nativeEvent.offsetX,
            offsetY: event.nativeEvent.offsetY,
        };
        event.dataTransfer.setDragImage(new Image(), 0, 0);
        event.dataTransfer.effectAllowed = 'move';
        groupBgRef.current.classList.add("_drag", "_move");
        wrapperRef.current.classList.add("_drag", "_move");
    }, [recordsGroup]);

    const onDragEndAll = useCallback((event: DragEvent<HTMLDivElement>) => {
        groupBgRef.current.classList.remove("_drag", "_move", "_copy", "_link", "_none");
        wrapperRef.current.classList.remove("_drag", "_move", "_copy", "_link", "_none");
    }, [recordsGroup]);


    return (
        <Fragment>
            <div
                className="timeline-editor-group-fg"
                ref={groupBgRef}
                onClick={onClick}
            >
                <div
                    className="timeline-editor-group-fg-content"
                    draggable
                    onDragStart={onDragStart}
                    onDrag={onDrag}
                    onDragEnd={onDragEndAll}
                />
                <div
                    className="timeline-record-scaling _left"
                    draggable
                    onDragStart={onDragStartLeft}
                    onDragEnd={onDragEndAll}
                />

                <div
                    className="timeline-record-scaling _right"
                    draggable
                    onDragStart={onDragStartRight}
                    onDragEnd={onDragEndAll}
                />
            </div>
            <div className="timeline-editor-grouping" ref={wrapperRef}>
                {children}
            </div>

        </Fragment>
    )
})