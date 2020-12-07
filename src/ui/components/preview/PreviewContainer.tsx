import * as React from "react"
import {FC} from "react";
import {BSTabsWithContent} from "../control/tabs/BSTabsWithContent";
import {CanvasDynPreview} from "./canvas/CanvasDynPreview";
import {DEFAULT_PREVIEW_FIELD_CONFIG, PreviewFieldConfig} from "./canvas/worker/PlixCanvasField";


export const PreviewContainer: FC = () => {


    return (
        <div style={{flexGrow: 1}}>
            <BSTabsWithContent tabs={["Dynamic", "Static", "Timed"]} type={"pills"} justify={true} >
                <div>
                    <CanvasDynPreview fieldConfig={DEFAULT_PREVIEW_FIELD_CONFIG}/>
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