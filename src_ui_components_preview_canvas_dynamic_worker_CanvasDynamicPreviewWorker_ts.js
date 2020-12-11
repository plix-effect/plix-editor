/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/ui/components/preview/canvas/dynamic/preview-field/PlixCanvasField.ts":
/*!***********************************************************************************!*\
  !*** ./src/ui/components/preview/canvas/dynamic/preview-field/PlixCanvasField.ts ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DEFAULT_PREVIEW_FIELD_CONFIG": () => /* binding */ DEFAULT_PREVIEW_FIELD_CONFIG,
/* harmony export */   "PlixCanvasField": () => /* binding */ PlixCanvasField
/* harmony export */ });
const TWO_PI = 2 * Math.PI;
const contourColor = "#444";
const DEFAULT_PREVIEW_FIELD_CONFIG = {
    width: 1000,
    height: 100,
    elements: Array.from({ length: 20 }).map((_, i) => {
        const size = 25;
        return { type: "pixel", props: { shape: i < 10 ? "circle" : "square", size: size, }, geometry: [40 + i * (size + 10), 40] };
    })
};
class PlixCanvasField {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }
    setConfig(cfg) {
        this.cfg = cfg;
        this.canvas.height = cfg.height;
        this.canvas.width = cfg.width;
    }
    getConfig() {
        return this.cfg;
    }
    get elementsCount() {
        return this.cfg.elements.length;
    }
    drawElementFromConfig(index, color, outlineColor = contourColor) {
        const element = this.cfg.elements[index];
        this.drawElement(element, color, outlineColor);
    }
    drawElement(element, color, outlineColor = contourColor) {
        if (element.type === "line")
            this.drawLine(element, color, outlineColor);
        else if (element.type === "pixel")
            this.drawPixel(element, color, outlineColor);
    }
    resetDraw() {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        const elements = this.cfg.elements;
        for (let i = 0; i < elements.length; i++) {
            this.drawElementFromConfig(i, null);
        }
    }
    drawLine(lineInfo, color, outlineColor = contourColor) {
        console.warn("drawLine not implemented");
    }
    drawPixel(pixelInfo, color, outlineColor = contourColor) {
        const [x, y] = pixelInfo.geometry;
        const ctx = this.ctx;
        const size = pixelInfo.props.size;
        function getSizeGain() {
            const { r, g, b, a } = color;
            const lum = 0.3 * r * a + 0.59 * g * a + 0.11 * b * a;
            const sizeGain = Math.min(lum / 128, 1);
            return sizeGain;
        }
        function drawSquare() {
            ctx.strokeStyle = outlineColor;
            const halfSize = size / 2;
            ctx.setLineDash([halfSize / 2, halfSize / 2]);
            ctx.strokeRect(x - halfSize - 1, y - halfSize - 1, size + 2, size + 2);
            if (!color)
                return;
            const sizeGain = getSizeGain();
            const colorSize = sizeGain * size;
            const halfColorSize = colorSize / 2;
            const { r, g, b, a } = color;
            ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
            ctx.fillRect(x - halfColorSize, y - halfColorSize, colorSize, colorSize);
        }
        function drawCircle() {
            ctx.beginPath();
            const radius = Math.floor(size / 2);
            ctx.setLineDash([radius / 2, radius / 2]);
            ctx.arc(x, y, radius + 1, 0, TWO_PI);
            ctx.strokeStyle = outlineColor;
            ctx.stroke();
            if (!color)
                return;
            const { r, g, b, a } = color;
            const sizeGain = getSizeGain();
            const innerRadius = Math.round(Math.sqrt(sizeGain) * radius);
            ctx.beginPath();
            ctx.arc(x, y, innerRadius, 0, TWO_PI);
            ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
            ctx.fill();
        }
        if (pixelInfo.props.shape === "circle") {
            drawCircle();
        }
        else {
            drawSquare();
        }
    }
    getElementAtPos(x, y) {
        const index = this.cfg.elements.findIndex((value, i) => {
            if (value.type === "pixel") {
                const size = value.props.size;
                const halfSize = size / 2;
                const [eX, eY] = value.geometry;
                const dx = eX - x;
                const dy = eY - y;
                if (value.props.shape === "circle") {
                    return Math.sqrt(dx * dx + dy * dy) <= halfSize;
                }
                else {
                    return Math.abs(dx) <= halfSize && Math.abs(dy) <= halfSize;
                }
            }
            return false;
        });
        if (index == -1)
            return [null, -1];
        return [this.cfg.elements[index], index];
    }
}


/***/ }),

/***/ "./src/ui/components/preview/canvas/dynamic/worker/CanvasDynamicPreviewWorker.ts":
/*!***************************************************************************************!*\
  !*** ./src/ui/components/preview/canvas/dynamic/worker/CanvasDynamicPreviewWorker.ts ***!
  \***************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _preview_field_PlixCanvasField__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../preview-field/PlixCanvasField */ "./src/ui/components/preview/canvas/dynamic/preview-field/PlixCanvasField.ts");
/* harmony import */ var _plix_effect_core_dist_parser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @plix-effect/core/dist/parser */ "./node_modules/@plix-effect/core/dist/parser/index.js");
/* harmony import */ var _plix_effect_core_effects__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @plix-effect/core/effects */ "./node_modules/@plix-effect/core/dist/effects/index.js");
/* harmony import */ var _plix_effect_core_filters__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @plix-effect/core/filters */ "./node_modules/@plix-effect/core/dist/filters/index.js");
/* harmony import */ var _CanvasFieldRenderer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./CanvasFieldRenderer */ "./src/ui/components/preview/canvas/dynamic/worker/CanvasFieldRenderer.ts");





;
let field;
let renderer;
let performanceOffset;
let lastPauseTime;
const syncPerformance = (globalValue) => {
    performanceOffset = globalValue - performance.now();
};
const handleInitMsg = (msg) => {
    field = new _preview_field_PlixCanvasField__WEBPACK_IMPORTED_MODULE_0__.PlixCanvasField(msg.canvas);
    renderer = new _CanvasFieldRenderer__WEBPACK_IMPORTED_MODULE_4__.CanvasFieldRenderer(field);
    syncPerformance(msg.performanceValue);
};
const handleSyncPerformanceMsg = (msg) => {
    syncPerformance(msg.value);
};
const handleChangePlaybackMsg = (msg) => {
    const status = msg.status;
    if (renderer.readyForRendering) {
        if (status === "play") {
            lastPauseTime = null;
            renderer.startRendering(msg.playFromStamp - performanceOffset, msg.rate);
        }
        else if (status === "pause") {
            lastPauseTime = msg.pauseTime;
            renderer.stopRendering();
            renderer.renderTime(msg.pauseTime);
        }
        else if (status === "stop") {
            lastPauseTime = null;
            renderer.stopRendering();
            field.resetDraw();
        }
    }
};
const handleRenderMsg = (msg) => {
    const renderData = msg.data;
    const effectData = renderData.render;
    const track = renderData.track;
    const duration = renderData.duration;
    const profileName = renderData.profileName;
    const parsedData = (0,_plix_effect_core_dist_parser__WEBPACK_IMPORTED_MODULE_1__.default)(effectData, track.effects, track.filters, _plix_effect_core_effects__WEBPACK_IMPORTED_MODULE_2__, _plix_effect_core_filters__WEBPACK_IMPORTED_MODULE_3__, track.profiles, profileName);
    const effectKeys = Object.keys(parsedData.effectsMap).sort();
    const filterKeys = Object.keys(parsedData.filtersMap).sort();
    const depsMessage = { type: "deps", deps: [effectKeys, filterKeys] };
    self.postMessage(depsMessage, []);
    renderer.setParsedData(parsedData);
    renderer.setDuration(duration);
    if (lastPauseTime != null)
        renderer.renderTime(lastPauseTime);
};
const handleChangeFieldMsg = (msg) => {
    field.setConfig(msg.config);
    if (renderer)
        renderer.renderTime(lastPauseTime !== null && lastPauseTime !== void 0 ? lastPauseTime : null);
};
onmessage = (event) => {
    const data = event.data;
    if (data.type === "init") {
        handleInitMsg(data);
    }
    else if (data.type === "sync_performance") {
        handleSyncPerformanceMsg(data);
    }
    else if (data.type === "change_playback") {
        handleChangePlaybackMsg(data);
    }
    else if (data.type === "render") {
        handleRenderMsg(data);
    }
    else if (data.type === "field") {
        handleChangeFieldMsg(data);
    }
};


/***/ }),

/***/ "./src/ui/components/preview/canvas/dynamic/worker/CanvasFieldRenderer.ts":
/*!********************************************************************************!*\
  !*** ./src/ui/components/preview/canvas/dynamic/worker/CanvasFieldRenderer.ts ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CanvasFieldRenderer": () => /* binding */ CanvasFieldRenderer
/* harmony export */ });
/* harmony import */ var _plix_effect_core_color__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @plix-effect/core/color */ "./node_modules/@plix-effect/core/dist/Color.js");
/* harmony import */ var _plix_effect_core_color__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_plix_effect_core_color__WEBPACK_IMPORTED_MODULE_0__);

class CanvasFieldRenderer {
    constructor(field) {
        this.currentRenderProcessId = null;
        this.field = field;
    }
    setParsedData(data) {
        this.parsedData = data;
    }
    setDuration(value) {
        this.duration = value;
    }
    renderTime(time) {
        this.field.resetDraw();
        if (!this.parsedData)
            return;
        if (time == null)
            return;
        const count = this.field.elementsCount;
        const line = this.parsedData.effect(time, this.duration);
        for (let i = 0; i < count; i++) {
            const mod = line(i, count);
            const color = mod(_plix_effect_core_color__WEBPACK_IMPORTED_MODULE_0__.BLACK);
            this.field.drawElementFromConfig(i, (0,_plix_effect_core_color__WEBPACK_IMPORTED_MODULE_0__.toRgba)(color));
        }
    }
    startRendering(playFromTimestamp, playbackRate) {
        const currentRafProcessId = this.currentRenderProcessId = Symbol();
        const doRender = () => {
            if (currentRafProcessId !== this.currentRenderProcessId)
                return;
            requestAnimationFrame(doRender);
            const time = performance.now() - playFromTimestamp;
            this.renderTime(time * playbackRate);
        };
        doRender();
    }
    stopRendering() {
        this.currentRenderProcessId = null;
    }
    get rendering() { return this.currentRenderProcessId != null; }
    get readyForRendering() { return this.parsedData != null && this.duration != null; }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// the startup function
/******/ 	__webpack_require__.x = () => {
/******/ 		// Load entry module
/******/ 		__webpack_require__("./src/ui/components/preview/canvas/dynamic/worker/CanvasDynamicPreviewWorker.ts");
/******/ 		// This entry module used 'exports' so it can't be inlined
/******/ 	};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => module['default'] :
/******/ 				() => module;
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks and sibling chunks for the entrypoint
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get mini-css chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference all chunks
/******/ 		__webpack_require__.miniCssF = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "style/style-" + chunkId + ".css";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/startup chunk dependencies */
/******/ 	(() => {
/******/ 		var next = __webpack_require__.x;
/******/ 		__webpack_require__.x = () => {
/******/ 			return __webpack_require__.e("vendors-node_modules_plix-effect_core_dist_effects_index_js-node_modules_plix-effect_core_dis-eb2327").then(next);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/importScripts chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "already loaded"
/******/ 		var installedChunks = {
/******/ 			"src_ui_components_preview_canvas_dynamic_worker_CanvasDynamicPreviewWorker_ts": 1
/******/ 		};
/******/ 		
/******/ 		// importScripts chunk loading
/******/ 		var chunkLoadingCallback = (data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			while(chunkIds.length)
/******/ 				installedChunks[chunkIds.pop()] = 1;
/******/ 			parentChunkLoadingFunction(data);
/******/ 		};
/******/ 		__webpack_require__.f.i = (chunkId, promises) => {
/******/ 			// "1" is the signal for "already loaded"
/******/ 			if(!installedChunks[chunkId]) {
/******/ 				importScripts("" + __webpack_require__.u(chunkId));
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunk_plix_effect_editor"] = self["webpackChunk_plix_effect_editor"] || [];
/******/ 		var parentChunkLoadingFunction = chunkLoadingGlobal.push.bind(chunkLoadingGlobal);
/******/ 		chunkLoadingGlobal.push = chunkLoadingCallback;
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// run startup
/******/ 	return __webpack_require__.x();
/******/ })()
;
//# sourceMappingURL=src_ui_components_preview_canvas_dynamic_worker_CanvasDynamicPreviewWorker_ts.js.map