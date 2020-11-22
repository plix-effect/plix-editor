import React, {FC, memo, MouseEvent, useContext, useMemo} from "react";
import {EditorPath} from "../../../types/Editor";
import {ValueTrack} from "./ValueTrack";
import {getArrayKey} from "../../../utils/KeyManager";
import {TrackContext} from "../TrackContext";
import {DeleteIndexAction} from "../PlixEditorReducerActions";
import {Track} from "../../timeline/Track";
import "./ArrayElementsTrack.scss";

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
                onClick(event: MouseEvent<HTMLElement>) {
                    if (event.altKey) dispatch(DeleteIndexAction(path, i))
                },
            }
        })
    }, [value, dispatch]);

    return (
        <Track>
            {null}
            {null}
            {valuesData.map(({key, value, path, index, onClick}) => {
                return (
                    <ValueTrack key={key} type={type} value={value} path={path}>
                        <span className="NO_drop-target">
                            <span className="array-track-drop-target _top" />
                            <span className="array-track-drop-target _center" />
                            <span className="array-track-drop-target _bottom" />
                        </span>

                        <span onClick={onClick} title="[Alt + Click] = delete">[{index}]</span>
                    </ValueTrack>
                );
            })}
        </Track>
    );
})