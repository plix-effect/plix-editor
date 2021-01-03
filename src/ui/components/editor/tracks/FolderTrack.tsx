import React, {FC, memo, MouseEventHandler, useCallback, useContext, useMemo} from "react";
import {EditorPath} from "../../../types/Editor";
import {TrackContext} from "../TrackContext";
import {DeleteAction, MultiAction} from "../PlixEditorReducerActions";
import {Track} from "../../timeline/Track";
import {PlixEffectJsonData} from "@plix-effect/core/types/parser";
import {PlixFilterJsonData, PlixProfile} from "@plix-effect/core/dist/types/parser";
import {useExpander} from "../track-elements/Expander";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {FolderElementsTrack} from "./FolderElementsTrack";

export interface FolderTrackProps {
    name: string,
    dir: string,
    items: {fullName: string, value: PlixEffectJsonData|PlixFilterJsonData|PlixProfile}[];
    type: "effect"|"filter"|"profile",
    path: EditorPath,
    canDelete?: boolean
}
export const FolderTrack: FC<FolderTrackProps> = memo(({items, type, path, dir, name, canDelete = false}) => {

    const {dispatch} = useContext(TrackContext);

    const deleteAction = useMemo(() => {
        if (!canDelete) return null;
        const deleteActions = items.map(({fullName}) => DeleteAction([...path, fullName]));
        return MultiAction(deleteActions);
    }, [canDelete, path, items])

    const [expanded, expander, changeExpanded] = useExpander(false);

    const onClick: MouseEventHandler<HTMLDivElement> = useCallback(({ctrlKey, shiftKey, altKey}) => {
        if (!ctrlKey && altKey && !shiftKey) {
            if (deleteAction) dispatch(deleteAction);
        }
    }, [deleteAction, dispatch]);

    const onDblClick: MouseEventHandler<HTMLDivElement> = useCallback(({ctrlKey, altKey, shiftKey}) => {
        if (!ctrlKey && !altKey && !shiftKey) changeExpanded();
    }, [changeExpanded]);

    const onClickDelete: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        event.stopPropagation();
        if (deleteAction) dispatch(deleteAction);
    }, [deleteAction, dispatch]);

    const rightIcons = (<>
        {(deleteAction) && (
            <i className="far fa-trash-alt track-tree-icon track-tree-icon-action" onClick={onClickDelete} title="delete"/>
        )}
    </>)

    return (
        <Track nested expanded={expanded}>
            <TreeBlock onClick={onClick} onDoubleClick={onDblClick} right={rightIcons} title={dir}>
                {expander}
                <span>{" "}</span>
                <i className="far fa-folder"/>
                <span>{" "}</span>
                <span className="track-description">{name}</span>
                <span>{" "}</span>
                <span className="track-description _desc">({items.length})</span>
            </TreeBlock>
            <TimelineBlock fixed>
                <span className="track-description _desc">{dir}</span>
            </TimelineBlock>
            <FolderElementsTrack
                type={type}
                path={path}
                dir={dir}
                items={items}
                canDelete={canDelete}
            />
        </Track>
    );
});