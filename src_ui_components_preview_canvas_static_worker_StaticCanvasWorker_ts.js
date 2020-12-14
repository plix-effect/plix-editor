/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/ui/components/preview/canvas/static/worker/StaticCanvasWorker.ts":
/*!******************************************************************************!*\
  !*** ./src/ui/components/preview/canvas/static/worker/StaticCanvasWorker.ts ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _plix_effect_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @plix-effect/core */ "./node_modules/@plix-effect/core/dist/parser/index.js");
/* harmony import */ var _plix_effect_core_color__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @plix-effect/core/color */ "./node_modules/@plix-effect/core/dist/Color.js");
/* harmony import */ var _plix_effect_core_color__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_plix_effect_core_color__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _plix_effect_core_effects__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @plix-effect/core/effects */ "./node_modules/@plix-effect/core/dist/effects/index.js");
/* harmony import */ var _plix_effect_core_filters__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @plix-effect/core/filters */ "./node_modules/@plix-effect/core/dist/filters/index.js");




let canvas;
let canvasCtx;
let parsedData;
let pixelCount = null;
let duration = 0;
let start;
const renderCanvas = () => {
    const effect = parsedData.effect;
    const width = canvas.width;
    const height = canvas.height;
    const statusRenderMessage = {
        type: "status",
        status: "render",
        error: null,
    };
    self.postMessage(statusRenderMessage, []);
    for (let h = 0; h < height; h++) {
        const colorMap = new Uint8ClampedArray(width * 4);
        const line = effect(h / height * duration, duration, start);
        for (let w = 0; w < width; w++) {
            const mod = line(w / width * pixelCount, pixelCount);
            const color = mod(_plix_effect_core_color__WEBPACK_IMPORTED_MODULE_1__.TRANSPARENT_BLACK);
            const { r, g, b, a } = (0,_plix_effect_core_color__WEBPACK_IMPORTED_MODULE_1__.toRgba)(color);
            const index = w * 4;
            colorMap[index] = r;
            colorMap[index + 1] = g;
            colorMap[index + 2] = b;
            colorMap[index + 3] = (a * 255) | 0;
        }
        const imageData = canvasCtx.createImageData(width, 1);
        imageData.data.set(colorMap);
        canvasCtx.putImageData(imageData, 0, h);
    }
    const statusDoneMessage = {
        type: "status",
        status: "done",
        error: null,
    };
    self.postMessage(statusDoneMessage, []);
};
onmessage = (event) => {
    const msg = event.data;
    if (msg.type === "init") {
        canvas = msg.canvas;
        canvasCtx = canvas.getContext("2d");
    }
    else if (msg.type === "effect") {
        const { render, track } = msg;
        duration = msg.duration;
        start = msg.start;
        try {
            const statusMessage = {
                type: "status",
                status: "parse",
                error: null,
            };
            self.postMessage(statusMessage, []);
            parsedData = (0,_plix_effect_core__WEBPACK_IMPORTED_MODULE_0__.default)(render, track.effects, track.filters, _plix_effect_core_effects__WEBPACK_IMPORTED_MODULE_2__, _plix_effect_core_filters__WEBPACK_IMPORTED_MODULE_3__);
            const effectKeys = Object.keys(parsedData.effectsMap).sort();
            const filterKeys = Object.keys(parsedData.filtersMap).sort();
            const depsMessage = { type: "deps", data: [effectKeys, filterKeys] };
            self.postMessage(depsMessage, []);
            renderCanvas();
        }
        catch (error) {
            const statusMessage = {
                type: "status",
                status: "error",
                error: String(error),
            };
            self.postMessage(statusMessage, []);
        }
    }
    else if (msg.type === "size") {
        canvas.width = msg.width;
        canvas.height = msg.height;
        pixelCount = msg.pixelCount;
        renderCanvas();
    }
};


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
/******/ 		__webpack_require__("./src/ui/components/preview/canvas/static/worker/StaticCanvasWorker.ts");
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
/******/ 			"src_ui_components_preview_canvas_static_worker_StaticCanvasWorker_ts": 1
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
//# sourceMappingURL=src_ui_components_preview_canvas_static_worker_StaticCanvasWorker_ts.js.map