import React, {
    ChangeEvent, DragEvent, DragEventHandler,
    FC, FormEventHandler, KeyboardEvent,
    memo,
    MouseEventHandler,
    useCallback,
    useContext, useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import {Track} from "../../timeline/Track";
import {PlixFiltersMapJsonData, PlixProfile, PlixProfileMap} from "@plix-effect/core/types/parser";
import {FilterTrack} from "./FilterTrack";
import {EditorPath} from "../../../types/Editor";
import {useExpander} from "../track-elements/Expander";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {TrackContext} from "../TrackContext";
import {DeleteAction, EditValueAction} from "../PlixEditorReducerActions";
import {PlixFilterJsonData} from "@plix-effect/core/dist/types/parser";
import {DisplayFilter} from "./editor/DisplayFilter";
import {DragType} from "../DragContext";
import {useSelectionControl, useSelectionPath} from "../SelectionContext";
import {ProfileTrack} from "./ProfileTrack";

export interface GroupProfilesTrackProps {
    profilesMap: PlixProfileMap,
    baseValue: PlixProfile,
    path: EditorPath,
    baseExpanded?: boolean
}
export const GroupProfilesTrack: FC<GroupProfilesTrackProps> = memo(({profilesMap = {}, path, baseExpanded, baseValue}) => {
    const [expanded, expander, changeExpanded, setExpanded] = useExpander(baseExpanded);
    const {dispatch} = useContext(TrackContext);

    const {toggleSelect, isSelectedPath, select} = useSelectionControl();
    const [profile, setProfile] = useState<PlixProfile|undefined>(undefined);
    const selectionPath = useSelectionPath();
    const selected = useMemo(() => {
        return isSelectedPath(path);
    }, [selectionPath]);

    const inputRef = useRef<HTMLInputElement>();

    const profilesList = useMemo(() => {
        return Object.keys(profilesMap).sort(/*a-z*/).map((name) => {
            return {
                name: name,
                path: [...path, name] as EditorPath,
                value: profilesMap[name],
            }
        })
    }, [profilesMap]);

    const count = useMemo(() => profilesList.length, [profilesList])

    const [name, setName] = useState("");
    const onEditName = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    }, [setName]);


    const add = useCallback(() => {
        if (!name) return;
        if (name in profilesMap) return;
        dispatch(EditValueAction([...path, name], defaultProfile));
        setName('');
        setExpanded(true);
    }, [name, profilesMap, path, dispatch]);

    const setEmptyProfile = useCallback(() => {
        setProfile(defaultProfile)
    }, [setProfile])

    const clearProfile = useCallback(() => {
        setProfile(undefined)
    }, [setProfile])

    const onClickTree: MouseEventHandler<HTMLDivElement> = useCallback(({ctrlKey, altKey, shiftKey}) => {
        if (!ctrlKey && altKey && !shiftKey) clearProfile()
        if (!ctrlKey && !altKey && shiftKey) {
            if (profile === undefined) setEmptyProfile();
        }
        if (!ctrlKey && !altKey && !shiftKey) select(path); // Click
        if (ctrlKey && !altKey && shiftKey) { // Ctrl+Shift
            toggleSelect(path);
        }
    }, [dispatch]);

    const onDblClickTree: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        if (!event.ctrlKey && !event.altKey && !event.shiftKey) changeExpanded();
        event.preventDefault();
    }, [changeExpanded]);

    const onClickTimeline: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        if (!event.ctrlKey && event.altKey && !event.shiftKey) clearProfile()
    }, [dispatch]);

    const onSubmit: FormEventHandler<HTMLFormElement> = useCallback((event) => {
        event.preventDefault();
        add();
    }, [add]);

    const onKeyDown = useCallback((event: KeyboardEvent<HTMLFormElement>) => {
        if (event.nativeEvent.code === "Escape") clearProfile();
    }, []);

    const onDragOverItemSelf = useCallback((event: DragEvent<HTMLElement>, dragData: DragType): void | [string, DragEventHandler] => {
        if (!dragData) return;
        if (event.shiftKey) return;

        let valueProfile: PlixProfile;
        const typedValue = dragData.typedValue;
        if (!typedValue) return;
        if (typedValue.type !== "profile") return;
        valueProfile = typedValue.value;

        dragData.dropEffect = "copy"
        return ["_drop-add-item", () => void setProfile(valueProfile)]
    }, [path, dispatch]);


    useEffect(() => {
        if (profile) inputRef.current.focus();
    }, [profile]);

    const onClickAdd: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        event.stopPropagation();
        setEmptyProfile();
    }, [setEmptyProfile]);

    const onClickClear: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        event.stopPropagation();
        clearProfile();
    }, [clearProfile]);

    const rightIcons = (<>
        {profile === undefined && (
            <i className="fa fa-plus track-tree-icon track-tree-icon-action" onClick={onClickAdd} title="add filter"/>
        )}
        {(profile !== undefined) && (
            <i className="fa fa-times track-tree-icon track-tree-icon-action" onClick={onClickClear} title="clear"/>
        )}
    </>);

    return (
        <Track nested expanded={expanded}>
            <TreeBlock type="title" onClick={onClickTree} onDoubleClick={onDblClickTree} selected={selected} onDragOverItem={onDragOverItemSelf} right={rightIcons}>
                {expander}
                <span className="track-description">Profiles ({count})</span>
            </TreeBlock>
            <TimelineBlock type="title" fixed onClick={onClickTimeline}>
                {profile === undefined && (<>
                    <span className="track-description _desc">Add new profile to customize effects and filters</span>
                    &nbsp;
                    <a onClick={setEmptyProfile}>[add]</a>
                </>)}
                {profile !== undefined && (<>
                    (todo: display profile)
                    &nbsp;
                    <form style={{margin:0}} onSubmit={onSubmit} onReset={clearProfile} onKeyDown={onKeyDown}>
                        <input autoFocus ref={inputRef} type="text" placeholder="prefab name" value={name} onChange={onEditName} />
                        <button type="submit" onClick={add} disabled={!name || name in profilesMap}>add</button>
                        <button type="reset">cancel</button>
                    </form>
                </>)}

            </TimelineBlock>
            {profilesList.map(alias => (
                <AliasProfileTrack name={alias.name} path={alias.path} key={alias.name} value={alias.value} baseValue={baseValue}/>
            ))}
        </Track>
    )
});

// todo: get default fieldConfig;
const defaultProfile = {filters: {}, effects: {}, fieldConfig: null};

interface AliasProfileTrackProps {
    value: PlixProfile,
    path: EditorPath,
    baseValue: PlixProfile,
    name: string,
}
const AliasProfileTrack: FC<AliasProfileTrackProps> = memo(({value, path, name, baseValue}) => {
    const deleteAction = useMemo(() => DeleteAction(path), [path]);

    return (
        <ProfileTrack value={value} path={path} name={name} deleteAction={deleteAction} baseValue={baseValue}>
            {name}
        </ProfileTrack>
    );
})