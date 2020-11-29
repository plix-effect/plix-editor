import React, {FC, memo, ReactNode, useCallback, useContext, useMemo} from "react";
import {Track} from "../../timeline/Track";
import {PlixEffectConfigurableJsonData} from "@plix-effect/core/types/parser";
import {EditorPath} from "../../../types/Editor";
import {TreeBlock} from "../track-elements/TreeBlock";
import {TimelineBlock} from "../track-elements/TimelineBlock";

import {TimelineEditor} from "./editor/TimelineEditor";
import {EffectTypeTrack} from "./EffectTypeTrack";
import {ValueTrack} from "./ValueTrack";
import {TrackContext} from "../TrackContext";
import "./tracks.scss"
import {EditValueAction} from "../PlixEditorReducerActions";
import {InlineJsonEditor} from "./editor/inline/InlineJsonEditor";
import {InlineNumberEditor} from "./editor/inline/InlineNumberEditor";
import {TimelineBlinkPreview} from "./editor/TimelineBlinkPreview";

export interface TimelineEffectTrackProps {
    effect: PlixEffectConfigurableJsonData,
    path: EditorPath,
    onChange: (type: null|"alias"|"constructor", value?: string) => void,
    expanded: boolean,
    leftBlock?: ReactNode
}
export const TimelineEffectTrack: FC<TimelineEffectTrackProps> = memo(({leftBlock, effect, effect: [,, params, filters], path, onChange, expanded}) => {

    const filtersPath = useMemo(() => [...path, 3], [path]);
    const timelinePath = useMemo(() => [...path, 2, 0], [path]);
    const valueFilters = useMemo(() => filters ?? [], [filters]);
    const {dispatch} = useContext(TrackContext);

    const onChangeCycle = useCallback((value) => {
        if (!value || !params[1]) {
            const newParams = [params[0], value ?? 0, params[2] ?? 1, params[3] ?? 0];
            return dispatch(EditValueAction([...path, 2], newParams));
        }
        if (!params[1]) {
            const newParams = [params[0], null, params[2] ?? 1, params[3] ?? 0];
            return dispatch(EditValueAction([...path, 2], newParams));
        }
        const zoom = value / params[1];
        const offset = params[3] ?? 0;
        const newRecords = (params[0] ?? []).map(([enabled, link, start, duration]) => {
            const zoomStart = (start - offset) * zoom + offset
            return [enabled, link, zoomStart, duration*zoom];
        });
        const newParams = [newRecords, value, params[2] ?? 1, offset];
        dispatch(EditValueAction([...path, 2], newParams));
    }, [path, params, dispatch]);

    const onChangeGrid = useCallback((value) => {
        const newParams = [params[0], params[1] ?? 0, value ?? 1, params[3] ?? 0];
        dispatch(EditValueAction([...path, 2], newParams));
    }, [path, params, dispatch]);

    const onChangeOffset = useCallback((value) => {
        const shift = value - params[3];
        const newRecords = (params[0] ?? []).map(([enabled, link, start, duration]) => {
            return [enabled, link, start+shift, duration];
        });
        const newParams = [newRecords, params[1] ?? 0, params[2] ?? 1, value ?? 0];
        dispatch(EditValueAction([...path, 2], newParams));
    }, [path, params, dispatch]);

    const clearFilters = useMemo(() => {
        return EditValueAction([...path, 3], []);
    }, [path]);

    return (
        <Track nested expanded={expanded}>
            {leftBlock}
            <TimelineBlock type="timeline">
                <TimelineEditor cycle={params[1]} grid={params[2]} offset={params[3]} records={params[0]} path={timelinePath} />
            </TimelineBlock>

            <EffectTypeTrack onChange={onChange} effect={effect} />

            <Track>
                <TreeBlock>
                    <span className="track-description">
                        Cycle
                    </span>
                </TreeBlock>
                <TimelineBlock fixed>
                    <InlineNumberEditor value={params[1]} onChange={onChangeCycle}/>
                </TimelineBlock>
            </Track>

            <Track>
                <TreeBlock>
                    <span className="track-description">
                        Grid
                    </span>
                </TreeBlock>
                <TimelineBlock fixed>
                    <InlineNumberEditor  value={params[2]} onChange={onChangeGrid}/>
                </TimelineBlock>
            </Track>

            <Track>
                <TreeBlock>
                    <span className="track-description">
                        Offset
                    </span>
                </TreeBlock>
                <TimelineBlock fixed>
                    <InlineNumberEditor value={params[3]} onChange={onChangeOffset}/>
                </TimelineBlock>
            </Track>

            {params[1] > 0 && (
                <Track>
                    <TreeBlock>
                    <span className="track-description">
                        Blink preview
                    </span>
                    </TreeBlock>
                    <TimelineBlock fixed>
                        <TimelineBlinkPreview cycle={params[1]} offset={params[3]} />
                    </TimelineBlock>
                </Track>

            )}


            <ValueTrack value={valueFilters} type={"array:filter"} path={filtersPath} description="filters applied to effect" clearAction={clearFilters}>
                Filters
            </ValueTrack>
        </Track>
    )
})
