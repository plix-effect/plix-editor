import React, {FC, memo} from "react";
import {Track} from "../../timeline/Track";
import {
    PlixFilterJsonData
} from "@plix-effect/core/types/parser";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";
import {FilterTypeEditor} from "./editor/FilterTypeEditor";
import "./tracks.scss"

export interface FilterTypeTrackProps {
    filter: PlixFilterJsonData,
    onChange: (type: null|"alias"|"constructor", value?: string) => void,
}
export const FilterTypeTrack: FC<FilterTypeTrackProps> = memo(({filter, onChange}) => {
    return (
        <Track>
            <TreeBlock>
                Filter type
            </TreeBlock>
            <TimelineBlock fixed>
                <FilterTypeEditor onChange={onChange} filter={filter} />
            </TimelineBlock>
        </Track>
    )
})