import * as React from "react"
import {FC, useContext, useMemo} from "react";
import {CanvasPreview} from "./canvas/CanvasPreview";
import {useSelectionItem, useSelectionPath} from "../editor/SelectionContext";
import {TrackContext} from "../editor/TrackContext";
import {BSTabsWithContent} from "../control/tabs/BSTabsWithContent";
import {CanvasDynPreview} from "./canvas/CanvasDynPreview";
import {FieldConfig} from "./canvas/worker/PlixCanvasField";

const DEFAULT_FIELD: FieldConfig = {
    width: 1000,
    height: 100,
    elements: Array.from({length: 20}).map((_, i) => {
        const size = 25;
        return {type: "pixel", shape: i<10 ? "circle" : "square", size: size, position: [40 + i * (size + 10), 40]}
    })
}
export const PreviewContainer: FC = () => {

    const path = useSelectionPath();
    const {selectedType, selectedItem} = useSelectionItem() ?? {};
    const {track} = useContext(TrackContext);
    const trackDuration = track?.['editor']?.['duration'] ?? 60*1000;

    const [effect, duration] = useMemo(() => {
        if (selectedType === "effect") {
            if (selectedItem && selectedItem[1] === "Timeline") return [selectedItem, trackDuration]
            else return [selectedItem, 3000];
        } else if (selectedType === "record") {
            const parent = se
        }
        return [track.render, trackDuration];
    }, [selectedItem, selectedType])

    return (
        <div style={{flexGrow: 1}}>
            <BSTabsWithContent tabs={["Static", "Dynamic", "Timed"]} type={"pills"} justify={true} >
                <div>
                    STATIC
                </div>
                <div>
                    <CanvasDynPreview duration={duration} render={selectedItem ?? track.render} track={track} fieldConfig={DEFAULT_FIELD}/>
                </div>
                <div>
                    NEEVR GOAN GIVE YUO UP
                </div>
            </BSTabsWithContent>
        </div>
    )
}