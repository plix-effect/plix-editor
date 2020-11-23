import {useCallback, useState} from "react";
import {useClickOutside} from "./useClickOutside";
import useLatestCallback from "./useLatestCallback";

type RefArgument = any;
type UIECReturnType = [
    boolean, // editMode
    (val: boolean | ((v: boolean) => boolean)) => void, // setEditMode
    () => void, // switchEditMode
]
type UseInlineEditableContainerFn = (containerRef: RefArgument, initEditMode: boolean, onClickOut?: () => void) => UIECReturnType

const VOID_FN = () => {}

export const useInlineEditableContainer: UseInlineEditableContainerFn = (containerRef, initEditMode, onClickOut) => {
    const [editMode, setEditMode] = useState(initEditMode);
    const latestOnClickOut = useLatestCallback(onClickOut || VOID_FN);

    const switchEditMode = useCallback(() => setEditMode(v => !v), [setEditMode]);

    const onClickOutsideCb = useCallback(() => {
        latestOnClickOut();
        setEditMode(false);
    }, [latestOnClickOut]);
    useClickOutside(containerRef, onClickOutsideCb, editMode);

    return [
        editMode,
        setEditMode,
        switchEditMode
    ]
}