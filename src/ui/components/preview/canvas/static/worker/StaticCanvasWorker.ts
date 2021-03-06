import parseRender from "@plix-effect/core";
import {toRgba, TRANSPARENT_BLACK} from "@plix-effect/core/color";
import {Effect} from "@plix-effect/core/types";
import * as effectConstructorMap from "@plix-effect/core/effects";
import * as filterConstructorMap from "@plix-effect/core/filters";
import {PlixEffectJsonData} from "@plix-effect/core/dist/types/parser";
import {PlixJsonData} from "@plix-effect/core/types/parser";

declare const self: Worker;

let canvas: OffscreenCanvas;
let canvasCtx: OffscreenCanvasRenderingContext2D;
let parsedData: ReturnType<typeof parseRender>;
let pixelCount: number|null = null;
let duration: number = 0;
let start: number;


const renderCanvas = () => {
    const effect: Effect = parsedData.effect;
    const width = canvas.width;
    const height = canvas.height;

    const statusRenderMessage: StaticPreviewWorkerOutputMessageStatus = {
        type: "status",
        status: "render",
        error: null,
    }
    self.postMessage(statusRenderMessage, []);

    for (let h=0; h<height; h++){
        const colorMap = new Uint8ClampedArray(width*4);
        const line = effect(h/height*duration, duration, start);
        for (let w=0; w<width; w++){
            const mod = line(w/width*pixelCount, pixelCount);
            const color = mod(TRANSPARENT_BLACK);
            const {r,g,b,a} = toRgba(color);
            const index = w * 4;
            colorMap[index] = r;
            colorMap[index+1] = g;
            colorMap[index+2] = b;
            colorMap[index+3] = (a*255)|0;
        }
        const imageData = canvasCtx.createImageData(width, 1);
        imageData.data.set(colorMap);
        canvasCtx.putImageData(imageData, 0, h);
    }

    const statusDoneMessage: StaticPreviewWorkerOutputMessageStatus = {
        type: "status",
        status: "done",
        error: null,
    }
    self.postMessage(statusDoneMessage, []);

}

onmessage = (event) => {
    const msg = event.data as StaticPreviewWorkerInputMessage;
    if (msg.type === "init") {
        canvas = msg.canvas;
        canvasCtx = canvas.getContext("2d");
    } else if (msg.type === "effect") {
        const {render, track} = msg;
        duration = msg.duration;
        start = msg.start;
        try {
            const statusMessage: StaticPreviewWorkerOutputMessageStatus = {
                type: "status",
                status: "parse",
                error: null,
            }
            self.postMessage(statusMessage, []);
            parsedData = parseRender(render, track.effects, track.filters, effectConstructorMap, filterConstructorMap );
            const effectKeys = Object.keys(parsedData.effectsMap).sort();
            const filterKeys = Object.keys(parsedData.filtersMap).sort();
            const depsMessage: StaticPreviewWorkerOutputMessageDeps = {type: "deps", data: [effectKeys, filterKeys]}
            self.postMessage(depsMessage, []);
            renderCanvas();
        } catch (error) {
            const statusMessage: StaticPreviewWorkerOutputMessageStatus = {
                type: "status",
                status: "error",
                error: String(error),
            }
            self.postMessage(statusMessage, []);
        }

    } else if (msg.type === "size") {
        canvas.width = msg.width
        canvas.height = msg.height;
        pixelCount = msg.pixelCount
        renderCanvas();
    }
}


export type StaticPreviewWorkerInputMessage =
    | StaticPreviewWorkerInputMessageInit
    | StaticPreviewWorkerInputMessageEffect
    | StaticPreviewWorkerInputMessageSizes

export interface StaticPreviewWorkerInputMessageInit {
    type: "init"
    canvas: OffscreenCanvas
}

export interface StaticPreviewWorkerInputMessageEffect {
    type: "effect"
    render: PlixEffectJsonData,
    track: PlixJsonData,
    duration: number,
    start: number,
    profileName: string|null,
}
export interface StaticPreviewWorkerInputMessageSizes {
    type: "size",
    width: number,
    height: number,
    pixelCount: number|null
}

export interface StaticPreviewWorkerOutputMessageDeps {
    type: "deps",
    data: [string[], string[]]
}

export interface StaticPreviewWorkerOutputMessageStatus {
    type: "status",
    status: "none" | "parse" | "render" | "done" | "error"
    error: string | null
}

export type StaticPreviewWorkerOutputMessage = StaticPreviewWorkerOutputMessageDeps | StaticPreviewWorkerOutputMessageStatus;