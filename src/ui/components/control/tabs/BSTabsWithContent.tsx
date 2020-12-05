import * as React from "react";
import {FC, useState} from "react";
import {BSTabs} from "./BSTabs";
import {BSTabsContent} from "./BSTabsContent";

interface BSTabsWithContentProps {
    tabs: string[]
    type?: "pills"|"tabs"
    justify?: boolean
    disabledIndexes?: number[]
}

export const BSTabsWithContent: FC<BSTabsWithContentProps> = ({tabs, type, justify, disabledIndexes, children}) => {

    const [activeIndex, setActiveIndex] = useState(0);

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