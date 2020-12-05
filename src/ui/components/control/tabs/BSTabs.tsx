import * as React from "react";
import {FC, useMemo} from "react";
import classNames from "classnames";

interface BSTabsProps {
    tabs: string[]
    activeIndex: number
    type?: "pills"|"tabs"
    justify?: boolean
    disabledIndexes?: number[],
    onChange: (index: number) => void
}

export const BSTabs: FC<BSTabsProps> = ({tabs, activeIndex, type = "tabs", justify=false, disabledIndexes=[], onChange}) => {

    const navClasses = useMemo(() => {
        return `nav ${type === "pills" ? "nav-pills" : "nav-tabs"} ${justify ? "nav-fill" : ""}`
    }, [type, justify])

    return (
        <ul className={navClasses}>
            {
                tabs.map((tabName, tabIndex) => {
                    const disabled = disabledIndexes.includes(tabIndex);
                    const active = activeIndex == tabIndex;
                    const anchorClz = classNames("nav-link", {"active": active, "disabled": disabled})
                    const onClickItem = () => {
                        onChange(tabIndex);
                    }
                    return (
                        <li className={"nav-item noselect"} key={tabIndex} onClick={onClickItem}>
                            <a className={anchorClz}>{tabName}</a>
                        </li>
                    )
                })
            }
        </ul>
    )
}