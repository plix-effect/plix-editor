import React, {FC} from "react";
import "./PlixEditor.scss";
import {BSTabsWithContent} from "../control/tabs/BSTabsWithContent";
import "./PlixLibBlock.scss";

const tabs = ["Filters", "Effects"];
export const PlixLibBlock: FC = () => {

    return (
        <div className="plix-lib-block">
            <BSTabsWithContent tabs={tabs} type={"pills"} justify={true} localStorageKey={"lib-tabs"}>
                <div className="plix-lib-container">
                    FIL<br/>
                    FIL<br/>
                    FIL<br/>
                    FIL<br/>
                    FIL<br/>
                    FIL<br/>
                    FIL<br/>
                    FIL<br/>
                    FIL<br/>
                    FIL<br/>
                    FIL<br/>
                    FIL<br/>
                    FIL<br/>
                    FIL<br/>
                    FIL<br/>
                    FIL<br/>
                    FIL<br/>
                </div>
                <div className="plix-lib-container">
                    EFF
                </div>
            </BSTabsWithContent>
        </div>
    )
}