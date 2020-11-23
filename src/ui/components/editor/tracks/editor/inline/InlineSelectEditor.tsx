import React, {ChangeEvent, FC, MutableRefObject, useCallback, useEffect, useRef, useState} from "react";
import "./InlineEditor.scss"
import Select from 'react-select';
import {ValueableRefType} from "./InlineEditor";

export type InlineSelectOption = InlineSelectOptionValue|InlineSelectOptionGroup

export type InlineSelectOptionValue = {
    value: string,
    type: "value"
    label: string
}
export type InlineSelectOptionGroup = {
    type: "group"
    label: string
    options: InlineSelectOptionValue[]
}

export interface InlineSelectEditorProps {
    value: string,
    onSubmit: (value: any) => void
    options: InlineSelectOption[]
    valuaebleRef: MutableRefObject<ValueableRefType>
}
export const InlineSelectEditor: FC<InlineSelectEditorProps> = ({value, onSubmit, valuaebleRef, options}) => {

    const selectRef = useRef<HTMLSelectElement>()

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
        console.log("SUBMIT SELECTEIDOTR", val)
        onSubmit(val);
    }

    const onChangeSelect = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        const item = getItemById(selectedValue);
        console.log("SUBMIT SELECTEIDOTR", item, selectedValue)
        onSubmit(item);
    }, []);

    useEffect(() => {
        valuaebleRef.current = {
            value: getItemById(value)
        }
    }, [value])

    // const getOptionView = (opt: InlineSelectOption, key: any) => {
    //     if (opt.type === "group") {
    //         return (
    //             <optgroup key={key} label={opt.label}>
    //                 {
    //                     opt.options.map((ch, i) => {
    //                         return getOptionView(ch,key+"-"+i);
    //                     })
    //                 }
    //             </optgroup>
    //         )
    //     } else {
    //         return (
    //             <option key={key} value={opt.value}>
    //                 {opt.label}
    //             </option>
    //         )
    //     }
    // }

    return (
        <div style={{width: 300}}>
            <Select
                defaultValue={value}
                options={options}
                className={"form-control"}
                value={value}
                autosize={true}
                autoFocus={true}
                setValue={onSetValue}
                menuPortalTarget={document.querySelector('body')}
                onChange={onChangeSelect}
            />
        </div>
    );
}