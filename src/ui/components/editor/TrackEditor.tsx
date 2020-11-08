import React, {
    FC,
    useCallback,
    useContext, useMemo,
    useState,
} from "react";
import {SplitLeftRight} from "../divider/SplitLeftRight";
import {PortalsContext, PortalsContextProps} from "../timeline/PortalsContext";
import {TrackContext} from "./TrackContext";
import {EffectTrack} from "./tracks/EffectTrack";
import {EditorPath} from "../../types/Editor";
import {Track} from "../timeline/Track";
import {GroupRenderTrack} from "./tracks/GroupRenderTrack";
import {GroupEffectsTrack} from "./tracks/GroupEffectsTrack";
import {GroupFiltersTrack} from "./tracks/GroupFiltersTrack";
import {SplitTimeline} from "../divider/SplitTimeline";



export const TrackEditor: FC = () => {
    const [leftRenderEl, setLeftRenderEl] = useState<HTMLDivElement>();
    const [rightRenderEl, setRightRenderEl] = useState<HTMLDivElement>();
    const {track} = useContext(TrackContext);

    const renderCtxValue: PortalsContextProps = {leftElement: leftRenderEl, rightElement: rightRenderEl}

    return (<>
        <SplitTimeline minLeft={100} minRight={200} storageKey="timeline">
            <div className="track-header track-header-tree">LEFT-HEADER</div>
            <div className="track-header track-header-timeline">(RIGHT_HEADER_RIGHT_HEADER_RIGHT_HEADER)</div>
            <div className="track-tree"  ref={setLeftRenderEl} />
            <div className="track-timeline"  ref={setRightRenderEl} />
        </SplitTimeline>
        <PortalsContext.Provider value={renderCtxValue}>
            <GroupRenderTrack render={track.render} pathName="render"/>
            <GroupEffectsTrack effectsMap={track.effects} pathName="effects"/>
            <GroupFiltersTrack filtersMap={track.filters} pathName="filters"/>
        </PortalsContext.Provider>
    </>)
}