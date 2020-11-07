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



export const TrackEditor: FC = () => {
    const [leftRenderEl, setLeftRenderEl] = useState<HTMLDivElement>();
    const [rightRenderEl, setRightRenderEl] = useState<HTMLDivElement>();
    const {track} = useContext(TrackContext);

    const renderCtxValue: PortalsContextProps = {leftElement: leftRenderEl, rightElement: rightRenderEl}

    return (<>
        <SplitLeftRight minLeft={100} minRight={200} storageKey="timeline">
            <div className="track-tree"  ref={setLeftRenderEl} />
            <div className="track-timeline"  ref={setRightRenderEl} />
        </SplitLeftRight>
        <PortalsContext.Provider value={renderCtxValue}>
            <Track>
                <div>LEFT-HEADER</div>
                <div>RIGHT-HEADER</div>
                <>
                    <GroupRenderTrack render={track.render} pathName="render"/>
                    <GroupEffectsTrack effectsMap={track.effects} pathName="effects"/>
                    <GroupFiltersTrack filtersMap={track.filters} pathName="filters"/>
                </>
            </Track>
        </PortalsContext.Provider>
    </>)
}