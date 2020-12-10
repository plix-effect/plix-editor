import React, {FC, useCallback, useState} from "react";
import "./PlixEditor.scss";
import "./PlixLibBlock.scss";

export const PlixLibBlock: FC = () => {

    const [type, setType] = useState("all");

    const onChangeRadio = useCallback((event) => {
        setType(event.target.value);
    }, [setType]);

    return (
        <div className="plix-lib-block">
            <div className="plix-lib-search">
                <input type="search" placeholder="search"/>
                <div className="plix-lib-search-radio" onChange={onChangeRadio}>
                    <label>
                        <input checked={type==="effects"} type="radio" name="type" value="effects"/>
                        effects
                    </label>
                    <label>
                        <input checked={type==="filters"} type="radio" name="type" value="filters"/>
                        filters
                    </label>
                    <label>
                        <input checked={type==="profiles"} type="radio" name="type" value="profiles"/>
                        profiles
                    </label>
                    <label>
                        <input checked={type==="all"} type="radio" name="type" value="all"/>
                        all
                    </label>
                </div>

            </div>
            <div className="plix-lib-result">
                result1<br/>
                result1<br/>
                result1<br/>
                result1<br/>
                result1<br/>
                result1<br/>
                result1<br/>
                result1<br/>
                result1<br/>
                result1<br/>
                result1<br/>
                result1<br/>
                result1<br/>
                result1<br/>
                result1<br/>
            </div>
        </div>
    )
}