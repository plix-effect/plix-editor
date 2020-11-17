import React, {FC, memo, ReactNode, useCallback, useContext, useMemo} from "react";
import {Track} from "../../timeline/Track";
import {EditorPath} from "../../../types/Editor";
import {ValueTrack} from "./ValueTrack";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {getArrayKey} from "../../../utils/KeyManager";
import {useExpander} from "../track-elements/Expander";
import {TrackContext} from "../TrackContext";
import {DeleteIndexAction, EditValueAction, PushValueAction} from "../PlixEditorReducerActions";

export interface ArrayElementsTrackProps {
    value: any[],
    type: string,
    path: EditorPath
}
export const ArrayElementsTrack: FC<ArrayElementsTrackProps> = memo(({value, type, path}) => {
    const {dispatch} = useContext(TrackContext);
    const valuesData = useMemo(() => {
        return value.map((val, i) => {
            const key = getArrayKey(value, i);
            const valPath: EditorPath = [...path, {key: String(key), array: value}]
            return {
                path: valPath,
                key: key,
                value: val,
                index: i,
                remove: () => dispatch(DeleteIndexAction(path, i)),
            }
        })
    }, [value, dispatch]);

    return (
        valuesData.map(({key, value, path, index, remove}) => {
            return (
                <ValueTrack key={key} type={type} value={value} path={path}>
                    <button className="btn _remove" onClick={remove}>X</button> [{index}]
                </ValueTrack>
            )
        })
    );
})