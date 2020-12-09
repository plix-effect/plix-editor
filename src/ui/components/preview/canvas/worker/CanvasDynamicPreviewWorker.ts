import {PlaybackStatus} from "../../../editor/PlaybackContext";
import {PlixEffectJsonData} from "@plix-effect/core/dist/types/parser";
import {PlixJsonData, PlixProfile} from "@plix-effect/core/types/parser";
import {PreviewFieldConfig, PlixCanvasField, OffscreenCanvasGeneric} from "../preview-field/PlixCanvasField";
import parseRender from "@plix-effect/core/dist/parser";
import * as effectConstructorMap from "@plix-effect/core/effects";
import * as filterConstructorMap from "@plix-effect/core/filters";
import {CanvasFieldRenderer} from "./CanvasFieldRenderer";


declare const self: Worker;

// TYPES
interface RenderMsgData {
    render: PlixEffectJsonData,
    track: PlixJsonData,
    profileName: string|null,
    duration: number
}
export type CvsDynPreviewInMsg =
    | CvsDynPreviewInMsgInit
    | CvsDynPreviewInMsgSyncPerformance
    | CvsDynPreviewInMsgChangePlayback
    | CvsDynPreviewInMsgRenderData
    | CvsDynPreviewInMsgChangeField
;

export interface CvsDynPreviewInMsgInit {
    type: "init",
    canvas: OffscreenCanvas
    performanceValue: number
}

export interface CvsDynPreviewInMsgSyncPerformance {
    type: "sync_performance",
    value: number
}

export interface CvsDynPreviewInMsgChangePlayback {
    type: "change_playback",
    playFromStamp: number,
    status: PlaybackStatus,
    pauseTime: number | null,
    rate: number | null
}
export interface CvsDynPreviewInMsgRenderData {
    type: "render",
    data: RenderMsgData
}
export interface CvsDynPreviewInMsgChangeField {
    type: "field",
    config: PreviewFieldConfig
}
export type CvsDynPreviewOutMsg =
    | CvsDynPreviewOutMsgDeps
;
export interface CvsDynPreviewOutMsgDeps {
    type: "deps"
    deps: [string[], string[]]
};

// Variables
let field: PlixCanvasField<OffscreenCanvasGeneric>;
let renderer: CanvasFieldRenderer;
let performanceOffset: number;
let lastPauseTime: number|null;

// Handlers
const syncPerformance = (globalValue) => {
    performanceOffset = globalValue - performance.now()
}

const handleInitMsg = (msg: CvsDynPreviewInMsgInit) => {
    field = new PlixCanvasField<OffscreenCanvasGeneric>(msg.canvas);
    renderer = new CanvasFieldRenderer(field);
    syncPerformance(msg.performanceValue);
}
const handleSyncPerformanceMsg = (msg: CvsDynPreviewInMsgSyncPerformance) => {
    syncPerformance(msg.value);
}
const handleChangePlaybackMsg = (msg: CvsDynPreviewInMsgChangePlayback) => {
    const status = msg.status;
    if (renderer.readyForRendering) {
        if (status === "play") {
            lastPauseTime = null;
            renderer.startRendering(msg.playFromStamp-performanceOffset, msg.rate);
        } else if (status === "pause") {
            lastPauseTime = msg.pauseTime;
            renderer.stopRendering();
            renderer.renderTime(msg.pauseTime);
        } else if (status === "stop") {
            lastPauseTime = null;
            renderer.stopRendering();
            field.resetDraw();
        }
    }
}

const handleRenderMsg = (msg: CvsDynPreviewInMsgRenderData) => {
    const renderData = msg.data
    const effectData = renderData.render;
    const track = renderData.track;
    const duration = renderData.duration;
    const profileName = renderData.profileName;

    const parsedData = parseRender(effectData, track.effects, track.filters, effectConstructorMap, filterConstructorMap, track.profiles, profileName);
    const effectKeys = Object.keys(parsedData.effectsMap).sort();
    const filterKeys = Object.keys(parsedData.filtersMap).sort();
    const depsMessage: CvsDynPreviewOutMsgDeps = { type: "deps", deps: [effectKeys, filterKeys]}
    self.postMessage(depsMessage, []);

    renderer.setParsedData(parsedData);
    renderer.setDuration(duration);
    if (lastPauseTime != null) renderer.renderTime(lastPauseTime);
}

const handleChangeFieldMsg = (msg: CvsDynPreviewInMsgChangeField) => {
    field.setConfig(msg.config);
    if (renderer) renderer.renderTime(lastPauseTime ?? null);
}

// On message
onmessage = (event) => {
    const data = event.data as CvsDynPreviewInMsg
    if (data.type === "init") {
        handleInitMsg(data);
    } else if (data.type === "sync_performance") {
        handleSyncPerformanceMsg(data);
    } else if (data.type === "change_playback") {
        handleChangePlaybackMsg(data);
    } else if (data.type === "render") {
        handleRenderMsg(data)
    } else if (data.type === "field") {
        handleChangeFieldMsg(data);
    }
}