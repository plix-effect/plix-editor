import * as React from "react"
import {FC} from "react";
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


    return (
        <div style={{flexGrow: 1}}>
            <BSTabsWithContent tabs={["Dynamic", "Static", "Timed"]} type={"pills"} justify={true} >
                <div>
                    <CanvasDynPreview fieldConfig={DEFAULT_FIELD}/>
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