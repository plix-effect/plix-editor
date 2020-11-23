import React, {ChangeEvent, FC, MutableRefObject, useCallback, useEffect, useRef, useState} from "react";
import "./InlineEditor.scss"
import {useInlineEditableContainer} from "../../../../../use/useInlineEditableContainer";
import { ChromePicker } from 'react-color'

export interface InlineJsonEditorEditorProps {
    color: any,
    onChange: (color: any) => void
}
export const InlineColorEditor: FC<InlineJsonEditorEditorProps> = ({color, onChange}) => {

    const [displayColorPicker, setDisplayColorPicker] = useState(false);

    const handleChange = useCallback((changedColor) => {
        console.log(changedColor.hsl);
    }, [onChange]);

    const handleClose = useCallback(() => {
        setDisplayColorPicker(false);
    }, [])

    const handleClick = useCallback(() => {
        setDisplayColorPicker((v) => !v);
    }, [])

    console.log("CLR",color);

    const styleColor = `hsl()`

    return (
        <form className={"inline-color-editor"}>
            <div>
                <div className={"swatch"} onClick={ handleClick }>
                    <div className={"color"} style={{backgroundColor: color}}/>
                </div>
                {
                    displayColorPicker ?
                        <div className={"popover"}>
                            <div className={"cover"} onClick={ handleClose }/>
                            <ChromePicker color={ color } onChange={ handleChange } />
                        </div>
                    :
                        null
                }
            </div>
        </form>
    );
}