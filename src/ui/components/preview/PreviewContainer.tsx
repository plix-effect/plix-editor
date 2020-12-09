import * as React from "react"
import {FC, useContext, useMemo} from "react";
import {BSTabsWithContent} from "../control/tabs/BSTabsWithContent";
import {CanvasDynPreview} from "./canvas/CanvasDynPreview";
import {DEFAULT_PREVIEW_FIELD_CONFIG, PreviewFieldConfig} from "./canvas/preview-field/PlixCanvasField";
import {useProfile} from "../editor/ProfileContext";
import {TrackContext} from "../editor/TrackContext";


export const PreviewContainer: FC = () => {

    const profile = useProfile();
    const {track} = useContext(TrackContext);

    const fieldConfig = useMemo(() => {
        return profile?.['fieldConfig'] ?? track?.['editor']?.['fieldConfig'] ?? DEFAULT_PREVIEW_FIELD_CONFIG;
    }, [profile, track]);

    return (
        <div style={{flexGrow: 1}}>
            <BSTabsWithContent tabs={["Dynamic", "Static", "Timed"]} type={"pills"} justify={true} localStorageKey={"preview-tabs"}>
                <div>
                    <CanvasDynPreview fieldConfig={fieldConfig}/>
                </div>
                <div>
                    STATIC
                </div>
                <div>
                    NEEVR GOAN GIVE YUO UP
                </div>
            </BSTabsWithContent>
        </div>
    )
}