import * as React from "react"
import {FC, useContext, useMemo} from "react";
import {CanvasPreview} from "./canvas/CanvasPreview";
import {useSelectionItem, useSelectionPath} from "../editor/SelectionContext";
import {TrackContext} from "../editor/TrackContext";
import {ScaleDisplayContext} from "../editor/ScaleDisplayContext";

export const PreviewContainer: FC = () => {

    const path = useSelectionPath();
    const {selectedType, selectedItem} = useSelectionItem() ?? {};
    const {track} = useContext(TrackContext);
    const trackDuration = track?.['editor']?.['duration'] ?? 60*1000;

    console.log("TRACKDUR",trackDuration)
    const duration = useMemo(() => {
        if (!selectedItem) return -1;
        if (selectedType === "effect" && path.length === 1 && path[0] === "render") {
            return trackDuration;
        } else {
            return 3000;
        }
    }, [selectedItem, selectedType])

    return (
        <div style={{flexGrow: 1}}>
            <CanvasPreview width={500} height={100} duration={duration} count={10} render={selectedItem} track={track}/>
        </div>
    )
}