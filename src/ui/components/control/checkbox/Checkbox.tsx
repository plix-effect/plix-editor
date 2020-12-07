import React, {ChangeEvent, FC, FormEvent, useCallback} from "react";
import "./Checkbox.scss"

interface CheckboxProps {
    value: boolean
    onChange: (boolean) => void;
}
export const Checkbox: FC<CheckboxProps> = ({value, onChange, children}) => {

    const onChangeCB = useCallback(() => {
        onChange(!value)
    }, [onChange, value])

    return (
        <div className="form-check checkbox" onClick={onChangeCB}>
            <input type="checkbox" className="form-check-input" checked={value} onChange={onChangeCB}/>
            <label className="form-check-label">{children}</label>
        </div>
    )
}