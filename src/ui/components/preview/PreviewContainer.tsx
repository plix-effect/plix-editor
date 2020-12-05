import * as React from "react"
import {FC, useContext, useMemo} from "react";
import {CanvasPreview} from "./canvas/CanvasPreview";
import {useSelectionItem, useSelectionPath} from "../editor/SelectionContext";
import {TrackContext} from "../editor/TrackContext";
import {BSTabsWithContent} from "../control/tabs/BSTabsWithContent";


export const PreviewContainer: FC = () => {

    const path = useSelectionPath();
    const {selectedType, selectedItem} = useSelectionItem() ?? {};
    const {track} = useContext(TrackContext);
    const trackDuration = track?.['editor']?.['duration'] ?? 60*1000;

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
            <BSTabsWithContent tabs={["Static", "Dynamic", "Timed"]} type={"pills"} justify={true}>
                <div>
                    STATIC
                </div>
                <div>
                    IM DYN
                </div>
                <div>
                    NEEVR GOAN GIVE YUO UP
                </div>
            </BSTabsWithContent>
            <CanvasPreview width={1000} height={50} duration={duration} count={20} render={selectedItem ?? track.render} track={track}/>
        </div>
    )
}