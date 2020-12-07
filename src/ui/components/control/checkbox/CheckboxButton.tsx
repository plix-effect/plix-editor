import React, {ChangeEvent, FC, FormEvent, useCallback} from "react";
import "./Checkbox.scss"

interface CheckboxButtonProps {
    value: boolean;
    colorClass?: string
    sizeClass?: string
    title?: string
    onChange: (boolean) => void;
}
export const CheckboxButton: FC<CheckboxButtonProps> = ({value, title, onChange, children, colorClass = "btn-primary", sizeClass = "btn-sm"}) => {

    const onChangeCB = useCallback(() => {
        onChange(!value)
    }, [onChange, value])

    return (
        <label className={`btn ${colorClass} ${sizeClass} ${value ? "active" : ""}`} title={title}>
            <input type="checkbox" checked={value} onChange={onChangeCB}/> {children}
        </label>
    )
}