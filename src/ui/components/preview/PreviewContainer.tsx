import * as React from "react"
import {FC} from "react";
import {BSTabsWithContent} from "../control/tabs/BSTabsWithContent";
import {CanvasDynPreview} from "./canvas/dynamic/CanvasDynPreview";
import {CanvasStaticPreview} from "./canvas/static/CanvasStaticPreview";
import "./PreviewContainer.scss"


export const PreviewContainer: FC = () => {

    return (
        <div className={"preview-container"}>
            <BSTabsWithContent tabs={["Dynamic", "Static", "Timed"]} type={"pills"} justify={true} localStorageKey={"preview-tabs"}>
                <div className={"_tab"}>
                    <CanvasDynPreview/>
                </div>
                <div className={"_tab"}>
                    <CanvasStaticPreview/>
                </div>
                <div className={"_tab"}>
                    NEEVR GOAN GIVE YUO UP
                </div>
            </BSTabsWithContent>
        </div>
    )
}