import * as React from "react";
import {FC, useState} from "react";
import {BSTabs} from "./BSTabs";
import {BSTabsContent} from "./BSTabsContent";
import {useLocalStorage} from "../../../use/useStorage";

interface BSTabsWithContentProps {
    tabs: string[]
    type?: "pills"|"tabs"
    justify?: boolean
    localStorageKey?: string
    disabledIndexes?: number[]
}

export const BSTabsWithContent: FC<BSTabsWithContentProps> = ({tabs, type, justify, disabledIndexes, children, localStorageKey}) => {

    const [activeIndex, setActiveIndex] = localStorageKey ? useLocalStorage(localStorageKey, 0) : useState(0);

    return (
        <React.Fragment>
            <BSTabs
                tabs={tabs}
                activeIndex={activeIndex}
                onChange={setActiveIndex}
                type={type}
                justify={justify}
                disabledIndexes={disabledIndexes}
            />
            <BSTabsContent active={activeIndex}>
                {children}
            </BSTabsContent>
        </React.Fragment>
    )
}