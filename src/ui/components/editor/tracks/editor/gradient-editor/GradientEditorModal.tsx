import React, {DragEvent, FC, useCallback, useMemo, useRef, useState} from "react";
import {BSModal} from "../../../../modal/BSModal";
import {PlixGradientData} from "@plix-effect/core/dist/parser/parseGradient";
import "./GradientEditor.scss"
import {gradientToHtmlString} from "./gradient-editor-utils";
import parseColor, {PlixColorData} from "@plix-effect/core/dist/parser/parseColor";
import {InlineColorEditor} from "../inline/InlineColorEditor";
import {LinearGradient} from "@plix-effect/core/dist/gradient/LinearGradient";
import {PlixColor, toNumber as plixColorToNumber, toRgba} from "@plix-effect/core/color";
import {BSModalPart} from "../../../../modal/BSModalPart";


const emptyImage = new Image();

const getLeftPositionStyle = (widthPart) => {
    return `calc(${widthPart*100}% - 7px)`
}

const getUpdatedGradientData = (origin: PlixGradientData, index: number, updateData: [number, PlixColorData]) => {
    const gd = origin[index];
    const element = [updateData[0] ?? gd[0], updateData[1] ?? gd[1]] as [number, PlixColorData]
    const fullData = origin.slice(0);
    fullData[index] = element;
    fullData.sort((a, b) => {
        if (a[0] == b[0]) return 0
        if (a[0] > b[0]) return 1
        return -1;
    });
    return fullData as PlixGradientData;
}

const getGradientDataWithNewMarker = (origin: PlixGradientData, el: [number, PlixColorData]) => {
    const fullData = origin.slice(0);
    fullData.push(el);
    fullData.sort((a, b) => {
        if (a[0] == b[0]) return 0
        if (a[0] > b[0]) return 1
        return -1;
    });
    return fullData as PlixGradientData;
}

interface GradientEditorModalProps {
    isOpen: boolean,
    close: (val: PlixGradientData|null) => void;
    value: PlixGradientData
}
export const GradientEditorModal: FC<GradientEditorModalProps> = ({isOpen, close, value}) => {

    const [gradientData, setGradientData] = useState(value ?? []);

    const htmlGradient = useMemo(() => {
        return gradientToHtmlString(gradientData);
    }, [gradientData])

    const onClickClose = (v) => {
        if (v) {
            close(v);
        } else {
            setGradientData(value);
            close(value);
        }
    }

    const buttonsView = useMemo(() => {
        return (closeFn) => {
            const saveClose = () => {
                closeFn(gradientData);
            }
            const cancelClose = () => {
                closeFn(value);
            }

            return (
                <div className={"btn-group"}>
                    <button className={"btn btn-sm btn-success"} onClick={saveClose}>OK</button>
                    <button className={"btn btn-sm btn-danger"} onClick={cancelClose}>Cancel</button>
                </div>
            )
        }
    }, [gradientData, value])

    const dragContainerRef = useRef<HTMLDivElement>();
    const previewContainerRef = useRef<HTMLDivElement>();
    const previewRef = useRef<HTMLDivElement>();
    const dragRefs = useRef<HTMLDivElement[]>();
    const dragOffset = useRef<number>(0);


    const onDragStart = useCallback((event: DragEvent<HTMLDivElement>) => {
        dragOffset.current = event.nativeEvent.offsetX;
        event.dataTransfer.setDragImage(emptyImage, 0, 0);
    }, []);

    const onDrag = useCallback((index: number, {clientX}: DragEvent<HTMLDivElement>) => {
        if (clientX === 0) return;
        const containerBcr = dragContainerRef.current.getBoundingClientRect();
        const dragValue = clientX - containerBcr.left - dragOffset.current
        applyDragValue(index, dragValue);
    }, [gradientData]);

    const onDragEnd = useCallback((index: number, {clientX}: DragEvent<HTMLDivElement>) => {
        if (clientX === 0) return;
        const containerBcr = dragContainerRef.current.getBoundingClientRect();
        const dragValue = clientX - containerBcr.left - dragOffset.current;
        let widthPart = dragValue/containerBcr.width;
        if (widthPart < 0) widthPart = 0
        else if (widthPart > 1) widthPart = 1;
        const updatedGradientData = getUpdatedGradientData(gradientData, index, [widthPart,undefined]);
        setGradientData(updatedGradientData);
    }, [gradientData]);

    const applyDragValue = useCallback((index: number, dragValue: number) => {
        const {width: containerWidth} = dragContainerRef.current.getBoundingClientRect();
        let widthPart = dragValue/containerWidth;
        if (widthPart < 0) widthPart = 0
        else if (widthPart > 1) widthPart = 1;

        const updatedGradientData = getUpdatedGradientData(gradientData, index, [widthPart,undefined]);

        previewRef.current.style.background = gradientToHtmlString(updatedGradientData);
        dragRefs.current[index].style.left = getLeftPositionStyle(widthPart);
        return true;
    }, [gradientData]);

    const markers = useMemo(() => {
        const refs: HTMLDivElement[] = [];
        const setDragRef = (i) => (node: HTMLDivElement) => {refs[i] = node};
        dragRefs.current = refs;
        return gradientData.map((gd, i) => {
            const onDragCallback = onDrag.bind(null, i);
            const onDragEndCallback = onDragEnd.bind(null, i);
            const {r,g,b,a} = toRgba(parseColor(gd[1],null));
            return (
                <div key={i}
                     ref={setDragRef(i)}
                     className={"grady-marker"}
                     style={{left: getLeftPositionStyle(gd[0]), backgroundColor: `rgba(${r},${g},${b},${a})`}}
                     draggable
                     onDragStart={onDragStart}
                     onDrag={onDragCallback}
                     onDragEnd={onDragEndCallback}
                />
            )
        })
    }, [gradientData, onDrag])

    const onChangeMarkerColor = useCallback((i: number, color: PlixColorData) => {
        const newGradient = getUpdatedGradientData(gradientData, i, [undefined, color]);
        setGradientData(newGradient);
    }, [gradientData])

    const onClickPreview = useCallback((e: React.MouseEvent) => {
        const rect = previewContainerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        let widthPart = x/rect.width;
        let color: number;
        if (!gradientData || gradientData.length == 0) {
            color = plixColorToNumber(parseColor({r:0, g: 0, b: 0, a:1}, null));
        } else {
            const linearGradientData = gradientData.map(gd => ({position: gd[0], color: parseColor(gd[1], null)}));
            const grad = LinearGradient(linearGradientData);
            color = plixColorToNumber(grad(widthPart))
        }
        const newGradient = getGradientDataWithNewMarker(gradientData, [widthPart, color])
        setGradientData(newGradient);
    }, [gradientData]);


    const onClickRemove = useCallback((i: number) => {
        const clone = gradientData.slice(0);
        clone.splice(i, 1);
        setGradientData(clone);
    }, [gradientData])

    const markersListView = useMemo(() => {
        return gradientData.map((gd, i) => {
            const onChangeColor = onChangeMarkerColor.bind(null, i);
            const remove = onClickRemove.bind(null,i);
            return (
                <div className={"list-markers-item"} key={i}>
                    <div className={"list-markers-item-name"}>
                        <a onClick={remove} className={"list-markers-item-name-remove"} title={"Remove"}>
                            <i className="fas fa-trash-alt"/>
                        </a>
                        <span>Marker №{i+1} ({(gd[0]*100).toFixed(1)}%):</span>
                    </div>
                    <div className={"list-markers-item-value"}>
                        <InlineColorEditor value={gd[1]} onChange={onChangeColor}/>
                    </div>
                </div>
            )
        })
    }, [gradientData])

    return (
        <BSModal isOpen={isOpen} close={onClickClose} size={"lg"}>
            <span>Gradient editor</span>
            <div className={"grady-content"}>
                <div className={"preview-container"} onDoubleClick={onClickPreview} ref={previewContainerRef} title={"Double click to add"}>
                    <span className={"transanim-background preview-container-bg"}>
                        <div className={"preview"} ref={previewRef} style={{background: htmlGradient}}/>
                    </span>
                    <div className={"markers-container"} ref={dragContainerRef}>
                        {markers}
                    </div>
                </div>
                <div className={"list-markers"}>
                    <label>Markers</label>
                    {markersListView}
                </div>
            </div>
            <BSModalPart>
                {buttonsView}
            </BSModalPart>
        </BSModal>
    )
}