import * as React from "react";
import {FC, useMemo} from "react";

interface BSTabsContentProps {
    active: number,
}

export const BSTabsContent: FC<BSTabsContentProps> = ({active, children}) => {
    const array = useMemo(() => {
        return React.Children.toArray(children)
    }, [children])

    return (
        <React.Fragment>
            {array[active]}
        </React.Fragment>
    )
}