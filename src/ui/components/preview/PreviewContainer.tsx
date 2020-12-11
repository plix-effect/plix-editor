import * as React from "react"
import {FC, useContext, useMemo} from "react";
import {BSTabsWithContent} from "../control/tabs/BSTabsWithContent";
import {CanvasDynPreview} from "./canvas/dynamic/CanvasDynPreview";
import {DEFAULT_PREVIEW_FIELD_CONFIG, PreviewFieldConfig} from "./canvas/dynamic/preview-field/PlixCanvasField";
import {useProfile} from "../editor/ProfileContext";
import {TrackContext} from "../editor/TrackContext";
import {CanvasStaticPreview} from "./canvas/static/CanvasStaticPreview";


export const PreviewContainer: FC = () => {

    return (
        <div style={{flexGrow: 1, display: "flex", flexDirection: "column"}}>
            <BSTabsWithContent tabs={["Dynamic", "Static", "Timed"]} type={"pills"} justify={true} localStorageKey={"preview-tabs"}>
                <div>
                    <CanvasDynPreview/>
                </div>
                <div style={{display: "flex", flexGrow: 1}}>
                    <CanvasStaticPreview/>
                </div>
                <div>
                    NEEVR GOAN GIVE YUO UP
                </div>
            </BSTabsWithContent>
        </div>
    )
}