/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/ui/components/preview/canvas/worker/CanvasPreviewWorker.ts":
/*!************************************************************************!*\
  !*** ./src/ui/components/preview/canvas/worker/CanvasPreviewWorker.ts ***!
  \************************************************************************/
/*! namespace exports */
/*! exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.r, __webpack_exports__, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _plix_effect_core_effects__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @plix-effect/core/effects */ "./node_modules/@plix-effect/core/dist/effects/index.js");
/* harmony import */ var _plix_effect_core_filters__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @plix-effect/core/filters */ "./node_modules/@plix-effect/core/dist/filters/index.js");
/* harmony import */ var _plix_effect_core_dist_parser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @plix-effect/core/dist/parser */ "./node_modules/@plix-effect/core/dist/parser/index.js");
/* harmony import */ var _plix_effect_core_color__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @plix-effect/core/color */ "./node_modules/@plix-effect/core/dist/Color.js");




let canvas;
let canvasCtx;
let performanceOffset;
let status;
let playFromTimestamp;
let renderData;
let parsedData;
const getCanvasSize = () => {
    return [canvas.width, canvas.height];
};
const handleInitMsg = (msg) => {
    canvas = msg.canvas;
    canvasCtx = canvas.getContext("2d");
    performanceOffset = msg.performanceValue - performance.now();
};
const handleSyncPerformanceMsg = (msg) => {
    performanceOffset = msg.value - performance.now();
};
const handlePlaybackStatusMsg = (msg) => {
    status = msg.status;
    if (parsedData != null && status === "play") {
        startRendering();
        return;
    }
    if (parsedData != null && status === "pause") {
        renderTime(msg.pauseTime);
        return;
    }
    if (status === "stop" && renderData != null) {
        renderEmptyPixels();
        return;
    }
};
const handlePlaybackData = (msg) => {
    playFromTimestamp = msg.playFromStamp - performanceOffset;
};
const handleRenderMsg = (msg) => {
    renderData = msg.data;
    const effectData = renderData.render;
    const track = renderData.track;
    parsedData = null;
    if (effectData != null) {
        parsedData = (0,_plix_effect_core_dist_parser__WEBPACK_IMPORTED_MODULE_2__.default)(effectData, track.effects, track.filters, _plix_effect_core_effects__WEBPACK_IMPORTED_MODULE_0__, _plix_effect_core_filters__WEBPACK_IMPORTED_MODULE_1__);
        const effectKeys = Object.keys(parsedData.effectsMap).sort();
        const filterKeys = Object.keys(parsedData.filtersMap).sort();
        self.postMessage([effectKeys, filterKeys], []);
    }
    canvas.width = msg.data.width;
    canvas.height = msg.data.height;
    if (status === "play") {
        startRendering();
    }
    else {
        renderEmptyPixels();
    }
};
const clearCanvas = () => {
    canvasCtx.fillStyle = "black";
    canvasCtx.fillRect(0, 0, ...getCanvasSize());
};
const renderEmptyPixels = () => {
    clearCanvas();
    const count = renderData.count;
    for (let i = 0; i < count; i++) {
        renderPixel(i);
    }
};
const renderTime = (time) => {
    clearCanvas();
    const count = renderData.count;
    const line = parsedData.effect(time, renderData.duration);
    for (let i = 0; i < count; i++) {
        const mod = line(i, count);
        const color = mod([0, 0, 0, 0]);
        renderPixel(i, color);
    }
};
const startPixelCoord = [25, 25];
const maxPixelRadius = 15;
const distanceBetweenPixels = 42;
const TwoPI = 2 * Math.PI;
const renderPixel = (pixelIndex, color) => {
    let [x, y] = startPixelCoord;
    x = x + (pixelIndex * distanceBetweenPixels);
    canvasCtx.beginPath();
    canvasCtx.setLineDash([5, 15]);
    canvasCtx.arc(x, y, maxPixelRadius + 1, 0, TwoPI);
    canvasCtx.strokeStyle = "white";
    canvasCtx.stroke();
    if (!color)
        return;
    const radius = Math.round(Math.sqrt(color[2]) * maxPixelRadius);
    const { r, g, b, a } = (0,_plix_effect_core_color__WEBPACK_IMPORTED_MODULE_3__.hslaToRgba)(color);
    canvasCtx.beginPath();
    canvasCtx.arc(x, y, radius, 0, TwoPI);
    canvasCtx.fillStyle = `rgba(${r},${g},${b},${a})`;
    canvasCtx.fill();
};
let rafRenderProcessId;
const startRendering = () => {
    const currentRafProcessId = rafRenderProcessId = Symbol();
    function doRender() {
        if (currentRafProcessId !== rafRenderProcessId || status !== "play")
            return;
        requestAnimationFrame(doRender);
        const time = performance.now() - playFromTimestamp;
        renderTime(time);
    }
    doRender();
};
onmessage = (event) => {
    const data = event.data;
    if (data.type === "init") {
        handleInitMsg(data);
    }
    else if (data.type === "sync_performance") {
        handleSyncPerformanceMsg(data);
    }
    else if (data.type === "playback_data") {
        handlePlaybackData(data);
    }
    else if (data.type === "playback_status") {
        handlePlaybackStatusMsg(data);
    }
    else if (data.type === "render") {
        handleRenderMsg(data);
    }
};
;


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
/******/ 		__webpack_require__("./src/ui/components/preview/canvas/worker/CanvasPreviewWorker.ts");
/******/ 		// This entry module used 'exports' so it can't be inlined
/******/ 	};
/******/ 	
/************************************************************************/
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
/******/ 			"src_ui_components_preview_canvas_worker_CanvasPreviewWorker_ts": 1
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
//# sourceMappingURL=src_ui_components_preview_canvas_worker_CanvasPreviewWorker_ts.js.map