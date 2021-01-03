import React, {FC, memo, useContext, useMemo} from "react";
import {EditorPath} from "../../../types/Editor";
import {DeleteAction} from "../PlixEditorReducerActions";
import {Track} from "../../timeline/Track";
import {PlixEffectJsonData, PlixFilterJsonData, PlixProfile} from "@plix-effect/core/types/parser";
import {EffectTrack} from "./EffectTrack";
import {FilterTrack} from "./FilterTrack";
import {FolderTrack} from "./FolderTrack";
import {ProfileTrack} from "./ProfileTrack";
import {TrackContext} from "../TrackContext";

interface ItemInfo {
    name: string,
    fullName: string,
    value: PlixEffectJsonData|PlixFilterJsonData|PlixProfile;
}
interface FolderInfo {
    name: string,
    dir: string,
    items: {fullName: string, value: PlixEffectJsonData|PlixFilterJsonData|PlixProfile}[];
}

export interface FolderElementsTrackProps {
    items: {fullName: string, value: PlixEffectJsonData|PlixFilterJsonData|PlixProfile}[],
    type: "effect"|"filter"|"profile",
    path: EditorPath,
    dir: string,
    canDelete?: boolean
}
export const FolderElementsTrack: FC<FolderElementsTrackProps> = memo(({items, type, path, dir, canDelete}) => {
    const {currentItems, folders} = useMemo(() => {
        const currentItems: ItemInfo[] = [];
        const folders: FolderInfo[] = [];
        const folderMap: {[key: string]: FolderInfo} = {};
        for (const item of items) {
            const offsetName = item.fullName.substr(dir.length);
            const indexOfSlash = offsetName.indexOf("/");
            if (indexOfSlash !== -1) {
                const folderName = offsetName.substr(0, indexOfSlash);
                let folder: FolderInfo;
                if (folderName in folderMap) {
                    folder = folderMap[folderName];
                } else {
                    folder = folderMap[folderName] = {
                        dir: dir + folderName + "/",
                        name: folderName,
                        items: [],
                    }
                    folders.push(folder);
                }
                folder.items.push(item);
            } else {
                currentItems.push({name: offsetName, fullName: item.fullName, value: item.value});
            }
        }
        return {currentItems, folders};
    }, [items]);

    return (
        <Track>
            {null}
            {null}
            {folders.map(({name, dir, items}) => (
                <FolderTrack key={name} name={name} dir={dir} items={items} type={type} path={path} canDelete={canDelete}/>
            ))}
            {currentItems.map(({value, fullName, name}) => (
                <AliasItemTrack
                    key={fullName}
                    type={type}
                    value={value}
                    parentPath={path}
                    fullName={fullName}
                    name={name}
                    canDelete={canDelete}
                />
            ))}
        </Track>
    );
});

interface AliasItemTrackProps {
    value: PlixEffectJsonData|PlixFilterJsonData|PlixProfile,
    parentPath: EditorPath,
    name: string,
    fullName: string,
    type: "effect"|"filter"|"profile",
    canDelete?: boolean
}
const AliasItemTrack: FC<AliasItemTrackProps> = memo(({value, parentPath, name, type, fullName, canDelete=false}) => {
    const path = useMemo(() => [...parentPath, fullName], [parentPath])
    const deleteAction = useMemo(() => canDelete ? DeleteAction(path) : undefined, [path, canDelete]);
    const {track} = useContext(TrackContext);

    if (type === "effect") return (
        <EffectTrack effect={value as PlixEffectJsonData} path={path} key={name} alias={fullName} deleteAction={deleteAction} title={fullName}>
            {name}
        </EffectTrack>
    )
    if (type === "profile") return (
        <ProfileTrack value={value as PlixProfile} path={path} name={fullName} deleteAction={deleteAction} baseValue={track}>
            {name}
        </ProfileTrack>
    )
    return (
        <FilterTrack filter={value as PlixFilterJsonData} path={path} key={name} alias={fullName} deleteAction={deleteAction} title={fullName}>
            {name}
        </FilterTrack>
    )
})