import {DragEventHandler, MutableRefObject, useCallback, useContext, useRef} from "react";
import {DragContext, DragType} from "../components/editor/DragContext";

export function useDragValue(dragValue: DragType, ref?: MutableRefObject<any>) {
    const dragRef = useContext(DragContext);
    const localRef = useRef<HTMLElement>();
    const draggableRef = ref ?? localRef;

    const onDragStart: DragEventHandler<HTMLDivElement> = useCallback((event) => {
        dragRef.current = {
            ...dragValue,
            offsetX: event.nativeEvent.offsetX,
            offsetY: event.nativeEvent.offsetY,
        }
        localStorage.setItem("plix_editor_drag", JSON.stringify(dragRef.current));
        event.dataTransfer.setData("plix/localstorage", "");
        draggableRef.current.classList.add("_drag");
        event.stopPropagation();
        event.dataTransfer.setDragImage(new Image(), 0, 0);
    }, [dragValue, draggableRef]);

    const onDrag = useCallback(() => {
        const dropEffect = dragRef.current?.dropEffect
        draggableRef.current.classList.remove("_move", "_copy", "_link", "_none");
        if (dropEffect) draggableRef.current.classList.add(`_${dropEffect}`);
    }, [dragRef, draggableRef]);

    const onDragEnd: DragEventHandler<HTMLDivElement> = useCallback((event) => {
        draggableRef.current.classList.remove("_drag","_move", "_copy", "_link", "_none");
    }, [dragValue, draggableRef]);

    return {onDragStart, onDrag, onDragEnd, draggableRef};
}