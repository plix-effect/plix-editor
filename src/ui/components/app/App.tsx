import * as React from "react";
import * as filters from "@plix/core/filters"
import  parseRender from "@plix/core"

export const App = () => {
    return (
        <>
            {Object.keys(filters).join(" ")}
        </>
    )
}