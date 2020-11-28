import {PlixEffectJsonData} from "@plix-effect/core/dist/types/parser";
import {PlixJsonData} from "@plix-effect/core/types/parser";

declare const self: Worker;
let canvas: OffscreenCanvas;
let canvasCtx: OffscreenCanvasRenderingContext2D

const getCanvasSize = (): [number, number] => {
    return [canvas.width, canvas.height]
}

onmessage = (event) => {
    const data = event.data as CanvasPreviewWorkerMsgData
    if (data.type === "init") {
        canvas = data.canvas;
        canvasCtx = canvas.getContext("2d");
    } else if (data.type === "paint") {
        canvasCtx.clearRect(0, 0, ...getCanvasSize());
        canvasCtx.fillStyle = "red";
        canvasCtx.fillRect(Math.random()*10, Math.random()* 10, 10,10)
    }
}

export type CanvasPreviewWorkerMsgData =
    | CanvasPreviewWorkerMessageInitData
    | CanvasPreviewWorkerMessagePintSmthData

export interface CanvasPreviewWorkerMessageInitData {
    type: "init",
    canvas: OffscreenCanvas
}

export interface CanvasPreviewWorkerMessagePintSmthData {
    type: "paint"
}