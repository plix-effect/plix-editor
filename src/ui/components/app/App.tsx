import * as React from "react";
import * as filters from "@plix-effect/core/filters"
import  parseRender from "@plix-effect/core"

export const App = () => {
    return (
        <>
            {Object.keys(filters).join(" ")}
        </>
    )
}