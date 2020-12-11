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


const renderCanvas = () => {
    const effect: Effect = parsedData.effect;
    const width = canvas.width;
    const height = canvas.height;

    const duration = height;
    const count = width;

    const colorMap = new Uint8ClampedArray(width*height*4);
    for (let h=0; h<height; h++){
        const line = effect(h/height*duration, duration);
        for (let w=0; w<width; w++){
            const mod = line(w/width*count, count);
            const color = mod(TRANSPARENT_BLACK);
            const {r,g,b,a} = toRgba(color);
            const index = ((h*width) + w) * 4;
            colorMap[index] = r;
            colorMap[index+1] = g;
            colorMap[index+2] = b;
            colorMap[index+3] = (a*255)|0;
        }
    }
    const imageData = canvasCtx.createImageData(width, height);
    imageData.data.set(colorMap);
    canvasCtx.putImageData(imageData, 0, 0);
}

onmessage = (event) => {
    const msg = event.data as StaticPreviewWorkerInputMessage;
    if (msg.type === "init") {
        canvas = msg.canvas;
        canvasCtx = canvas.getContext("2d");
    } else if (msg.type === "effect") {
        const {render, track} = msg;

        parsedData = parseRender(render, track.effects, track.filters, effectConstructorMap, filterConstructorMap );
        const effectKeys = Object.keys(parsedData.effectsMap).sort();
        const filterKeys = Object.keys(parsedData.filtersMap).sort();

        self.postMessage([effectKeys, filterKeys], []);
        renderCanvas();
    } else if (msg.type === "size") {
        canvas.width = msg.width
        canvas.height = msg.height;
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
    profileName: string|null,
}
export interface StaticPreviewWorkerInputMessageSizes {
    type: "size",
    width: number,
    height: number,
}

export type StaticPreviewWorkerOutputMessage = [string[], string[]]