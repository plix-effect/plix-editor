import {createContext} from "react";
import {PlixJsonData} from "@plix-effect/core/types/parser";
import type render from "@plix-effect/core"

export interface TrackContextProps {
    track: PlixJsonData,
    modify: (...args: any[]) => void,
    effectConstructorMap?: Parameters<typeof render>[3]
    filterConstructorMap?: Parameters<typeof render>[4]
}
export const TrackContext = createContext<TrackContextProps|null>(null);