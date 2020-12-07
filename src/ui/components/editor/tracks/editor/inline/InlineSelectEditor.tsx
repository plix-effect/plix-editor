import React, {ChangeEvent, FC, MutableRefObject, ReactNode, useCallback, useEffect, useRef, useState} from "react";
import "./InlineEditor.scss"
import Select from 'react-select';
import {useInlineEditableContainer} from "../../../../../use/useInlineEditableContainer";

export type InlineSelectOption = InlineSelectOptionValue|InlineSelectOptionGroup

export type InlineSelectOptionValue = {
    value: string,
    type: "value"
    label: ReactNode
}
export type InlineSelectOptionGroup = {
    type: "group"
    label: ReactNode
    options: InlineSelectOptionValue[]
}


const colourStyles = {
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
        return {
            ...styles,
            backgroundColor: isSelected ? "#4fba06": "#FFFFFF",
            color: isSelected ? "#FFFFFF" : "#000",
            cursor: isDisabled ? 'not-allowed' : 'pointer',
        };
    },
};

export interface InlineSelectEditorProps {
    value: InlineSelectOptionValue,
    onChange: (value: any) => void,
    options: InlineSelectOption[],
    emptyText?: string
    allowEmpty?: boolean
}

export const InlineSelectEditor: FC<InlineSelectEditorProps> = ({value, onChange, options, emptyText="Not selected", allowEmpty=true}) => {

    const formRef = useRef<HTMLFormElement>();
    const [editMode, setEditMode, toggleEditMode] = useInlineEditableContainer(formRef,false)

    const getItemById = (id: string, searchList =  options) => {
        let item = null;
        for (let i = 0; i < searchList.length; i++) {
            let opt = searchList[i];
            if (opt.type === "value" && opt.value == id) {
                item = opt;
                break;
            }
            if (opt.type === "group") {
                const found = getItemById(id, opt.options);
                if (found !== null) {
                    item = found;
                    break;
                }
            }
        }
        return item;
    }

    const onSetValue = (val, type) => {
        onChange(val);
        setEditMode(false);
    }

    return (
        <form ref={formRef} className={"inline-select-editor"}>
            {
                editMode ?
                    (
                        <Select
                            defaultValue={value}
                            options={options}
                            className={"form-control"}
                            value={value}
                            autosize={true}
                            isClearable={allowEmpty}
                            menuPlacement="auto"
                            autoFocus={true}
                            onChange={onSetValue}
                            menuPortalTarget={document.querySelector('body')}
                            defaultMenuIsOpen={true}
                            theme={(theme) => ({
                                ...theme,
                                colors: {
                                    ...theme.colors,
                                    text: 'orangered',
                                    primary25: 'hotpink',
                                    primary: 'black',
                                },
                            })}
                            styles={colourStyles}
                        />
                    )
                :
                    (
                        <span className={"inline-editor-span"} title={"Click to edit"} onClick={toggleEditMode}>{(value && value.label) || emptyText}</span>
                    )
            }
        </form>
    );
}