import type {PlixEffectJsonData} from "@plix-effect/core/dist/types/parser";
import type {PlixJsonData} from "@plix-effect/core/types/parser";
import type {PlaybackStatus} from "../../../../editor/PlaybackContext";
import * as effectConstructorMap from "@plix-effect/core/effects";
import * as filterConstructorMap from "@plix-effect/core/filters";
import parseRender from "@plix-effect/core/dist/parser";
import {RGBAColor} from "@plix-effect/core/types";
import {toRgba, BLACK} from "@plix-effect/core/color";

interface RenderMsgData {
    width: number,
    height: number,
    render: PlixEffectJsonData,
    track: PlixJsonData,
    duration: number,
    count: number,
}

declare const self: Worker;
let canvas: OffscreenCanvas;
let canvasCtx: OffscreenCanvasRenderingContext2D
let performanceOffset: number
let status: PlaybackStatus;
let playbackRate: number|null;
let lastPauseTime: number|null;
let playFromTimestamp: number
let renderData: RenderMsgData;
let parsedData: ReturnType<typeof parseRender>


const getCanvasSize = (): [number, number] => {
    return [canvas.width, canvas.height]
}

const handleInitMsg = (msg: CanvasPreviewWkInMsgInit) => {
    canvas = msg.canvas;
    canvasCtx = canvas.getContext("2d");
    performanceOffset = msg.performanceValue - performance.now();
}
const handleSyncPerformanceMsg = (msg: CanvasPreviewWkInMsgSyncPerformance) => {
    performanceOffset = msg.value - performance.now();
}
const handlePlaybackStatusMsg = (msg: CanvasPreviewWkInMsgPlaybackStatus) => {
    status = msg.status;
    if (parsedData != null && status === "play") {
        playbackRate = msg.rate;
        startRendering();
        return;
    }
    if (parsedData != null && status === "pause") {
        lastPauseTime = msg.pauseTime
        renderTime(lastPauseTime);
        return;
    }
    if (status === "stop" && renderData != null) {
        renderEmptyPixels();
        return;
    }
}
const handlePlaybackData = (msg: CanvasPreviewWkInMsgPlaybackData) => {
    playFromTimestamp = msg.playFromStamp - performanceOffset;
}
const handleRenderMsg = (msg: CanvasPreviewWkInMsgRender) => {
    renderData = msg.data;
    const effectData = renderData.render;
    const track = renderData.track;
    parsedData = null;
    if (effectData != null) {
        parsedData = parseRender(effectData, track.effects, track.filters, effectConstructorMap, filterConstructorMap);
        const effectKeys = Object.keys(parsedData.effectsMap).sort();
        const filterKeys = Object.keys(parsedData.filtersMap).sort();
        self.postMessage([effectKeys, filterKeys], []);
    }

    canvas.width = msg.data.width;
    canvas.height = msg.data.height;

    if (status === "play") {
        startRendering();
    } else if (status === "pause") {
        renderTime(lastPauseTime);
    } else {
        renderEmptyPixels();
    }
}

const clearCanvas = () => {
    canvasCtx.fillStyle = "black";
    canvasCtx.fillRect(0,0, ...getCanvasSize());
}

const renderEmptyPixels = () => {
    clearCanvas();
    const count = renderData.count;
    for (let i = 0; i < count; i++) {
        renderPixel(i);
    }
}

const renderTime = (time: number) => {
    clearCanvas();
    if (!parsedData) return;
    const count = renderData.count;
    const line = parsedData.effect(time, renderData.duration);
    for (let i = 0; i < count; i++) {
        const mod = line(i, count);
        const color = mod(BLACK);
        renderPixel(i, toRgba(color));
    }
}

const startPixelCoord = [25,25];
const maxPixelRadius = 15;
const distanceBetweenPixels = 42;
const TwoPI = 2 * Math.PI;
const renderPixel = (pixelIndex: number, color?: RGBAColor) => {
    let [x,y] = startPixelCoord;
    x = x+(pixelIndex*distanceBetweenPixels);
    canvasCtx.beginPath();
    canvasCtx.setLineDash([5, 15]);
    canvasCtx.arc(x, y, maxPixelRadius+1, 0, TwoPI);
    canvasCtx.strokeStyle = "#444";
    canvasCtx.stroke();
    if (!color) return;
    const {r,g,b,a} = color;
    const lum = 0.3 * r*a + 0.59 * g*a + 0.11 * b*a; // luminosity value: 0-255
    const sizeGain = Math.min(lum/128, 1); // L
    const radius = Math.round(Math.sqrt(sizeGain)*maxPixelRadius);
    canvasCtx.beginPath();
    canvasCtx.arc(x, y, radius, 0, TwoPI);
    canvasCtx.fillStyle = `rgba(${r},${g},${b},${a})`;
    canvasCtx.fill();
}

let rafRenderProcessId: Symbol
const startRendering = () => {
    const currentRafProcessId = rafRenderProcessId = Symbol();

    function doRender() {
        if (currentRafProcessId !== rafRenderProcessId || status !== "play") return;
        requestAnimationFrame(doRender);
        const time = performance.now() - playFromTimestamp;
        renderTime(time * playbackRate);
    }
    doRender();
}

onmessage = (event) => {
    const data = event.data as CanvasPreviewWkInMsg
    if (data.type === "init") {
        handleInitMsg(data);
    } else if (data.type === "sync_performance") {
        handleSyncPerformanceMsg(data);
    } else if (data.type === "playback_data") {
        handlePlaybackData(data);
    } else if (data.type === "playback_status") {
        handlePlaybackStatusMsg(data);
    } else if (data.type === "render") {
        handleRenderMsg(data)
    }
}


export type CanvasPreviewWkInMsg =
    | CanvasPreviewWkInMsgInit
    | CanvasPreviewWkInMsgSyncPerformance
    | CanvasPreviewWkInMsgPlaybackData
    | CanvasPreviewWkInMsgPlaybackStatus
    | CanvasPreviewWkInMsgRender
;
export interface CanvasPreviewWkInMsgInit {
    type: "init",
    canvas: OffscreenCanvas
    performanceValue: number
}

export interface CanvasPreviewWkInMsgSyncPerformance {
    type: "sync_performance",
    value: number
}

export interface CanvasPreviewWkInMsgPlaybackData {
    type: "playback_data",
    playFromStamp: number
}
export interface CanvasPreviewWkInMsgPlaybackStatus {
    type: "playback_status",
    status: PlaybackStatus,
    pauseTime: number | null
    rate: number | null
}
export interface CanvasPreviewWkInMsgRender {
    type: "render",
    data: RenderMsgData
}


export type CanvasPreviewWkOutMsg =
    | CanvasPreviewWkOutMsgDeps
;
export interface CanvasPreviewWkOutMsgDeps {
    type: "deps"
    deps: [string[], string[]]
};