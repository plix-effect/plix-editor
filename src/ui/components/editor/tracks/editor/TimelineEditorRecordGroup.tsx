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
import {ScaleDisplayContext} from "../../ScaleDisplayContext";
import "./TimelineEditor.scss";
import {PlixTimeEffectRecordJsonData} from "@plix-effect/core/dist/parser/parseTimeEffectRecord";
import {TimelineEditorGrid} from "./timeline/TimelineEditorGrid";
import {Records} from "./timeline/Records";
import {DragContext, DragType, DragTypes} from "../../DragContext";
import {TrackContext} from "../../TrackContext";
import {
    DeleteAction,
    EditValueAction,
    InsertIndexAction,
    MultiAction, MultiActionType,
    PushValueAction
} from "../../PlixEditorReducerActions";
import {EditorPath} from "../../../../types/Editor";
import {generateColorByText} from "../../../../utils/generateColorByText";
import {TIMELINE_LCM} from "@plix-effect/core";
import {getArrayKey} from "../../../../utils/KeyManager";
import {PlixEffectJsonData} from "@plix-effect/core/types/parser";
import {ConstructorContext} from "../../ConstructorContext";
import {ParseMeta} from "../../../../types/ParseMeta";

type PositionM = [startM: number, endM: number];

export interface TimelineEditorRecordGroupProps {
    recordsGroup: DragTypes["recordsGroup"]|null,
    setRecordsGroup: (records: DragTypes["recordsGroup"]|null) => void,
    children: ReactNode;
    offset: number;
    bpm: number;
    grid: number;
    records: PlixTimeEffectRecordJsonData[],
    path: EditorPath,
}

export const TimelineEditorRecordGroup = memo<TimelineEditorRecordGroupProps>(({recordsGroup, records, path, setRecordsGroup, children, offset, bpm, grid}) => {
    const groupBgRef = useRef<HTMLDivElement>();
    const groupFgRef = useRef<HTMLDivElement>();
    const {duration} = useContext(ScaleDisplayContext);
    const {dispatch} = useContext(TrackContext);
    const {effectConstructorMap} = useContext(ConstructorContext);
    const cycle = 60000 / bpm;

    useEffect(() => {
        let startD = -1;
        let durationD = 0;
        if (recordsGroup) {
            const [startM, endM] = recordsGroup.position;
            startD = (offset + startM * cycle / TIMELINE_LCM) / duration;
            durationD = (endM - startM) * cycle / TIMELINE_LCM / duration;
        }
        groupBgRef.current.style.left = `${startD * 100}%`;
        groupBgRef.current.style.width = `${durationD * 100}%`;
        groupFgRef.current.style.left = `${startD * 100}%`;
        groupFgRef.current.style.width = `${durationD * 100}%`;
    }, [recordsGroup, offset, cycle, duration]);

    const deleteAction = useMemo<null|MultiActionType>(() => {
        if (!recordsGroup) return null;
        const deleteActions = recordsGroup.records.map(record => {
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
            const paramPreset = [recordsGroup.records, bpm, grid, offset];
            const effectParams = meta.defaultValues.map((value, i) => {
                if (i < paramPreset.length) return paramPreset[i];
                return value;
            })
            effect = [true, "Timeline", effectParams, []]
        }
        return {
            recordsGroup,
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
        groupFgRef.current.classList.add("_drag");
        event.stopPropagation();
        event.dataTransfer.setDragImage(new Image(), 0, 0);
    }, [dragValue, groupFgRef]);

    const onDrag = useCallback(() => {
        const dropEffect = dragRef.current?.dropEffect
        groupFgRef.current.classList.remove("_move", "_copy", "_link", "_none");
        if (dropEffect) groupFgRef.current.classList.add(`_${dropEffect}`);
    }, [dragRef, groupFgRef]);

    const onDragEnd: DragEventHandler<HTMLDivElement> = useCallback((event) => {
        groupFgRef.current.classList.remove("_drag","_move", "_copy", "_link", "_none");
    }, [dragValue, groupFgRef]);


    return (
        <Fragment>
            <div className="timeline-editor-group-bg" ref={groupBgRef}/>
            {children}
            <div
                className="timeline-editor-group-fg"
                draggable
                onDragStart={onDragStart}
                onDrag={onDrag}
                onDragEnd={onDragEnd}
                ref={groupFgRef}
                onClick={onClick}
            />
        </Fragment>
    )
})