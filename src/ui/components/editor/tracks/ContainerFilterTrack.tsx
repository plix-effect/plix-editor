import React, {ReactNode, useMemo, memo} from "react";
import {Track} from "../../timeline/Track";
import {PlixFilterConfigurableJsonData} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {TimelineBlock} from "../track-elements/TimelineBlock";

import "./tracks.scss"
import {ArrayElementsTrack} from "./ArrayElementsTrack";
import {RenameTrack} from "./RenameTrack";
import {InlineFilterTypeEditor} from "./editor/inline/InlineFilterTypeEditor";
import {FilterParamsTrack} from "./FilterParamsTrack";

export interface ContainerFilterTrackProps {
    filter: PlixFilterConfigurableJsonData,
    path: EditorPath,
    alias?: string,
    expanded: boolean,
    onChange: (type: null|"alias"|"constructor", value?: string) => void,
    leftBlock?: ReactNode,
}
export const ContainerFilterTrack = memo<ContainerFilterTrackProps>(({leftBlock, alias, filter, path, expanded, onChange}) => {
    const params = filter[2];
    const paramFilters = useMemo(() => params[0] || [], [params]);
    const paramFiltersPath = useMemo(() => [...path, 2, 0], [path]);

    return (
        <Track nested expanded={expanded}>
            {leftBlock}
            <TimelineBlock fixed>
                <InlineFilterTypeEditor onChange={onChange} filter={filter} />
            </TimelineBlock>

            {alias != null && (<RenameTrack value={alias} type={"filter"}/>)}

            <ArrayElementsTrack value={paramFilters} type="filter" path={paramFiltersPath} canDelete/>

            <FilterParamsTrack filter={filter} path={path} skipParams={1}/>
        </Track>
    )
})
