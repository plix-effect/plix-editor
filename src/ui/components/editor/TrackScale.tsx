import React, {FC, useCallback, useContext, useMemo, useState} from "react";
import "./TrackScale.scss";
import {ScaleDisplayContext} from "./ScaleDisplayContext";

export const TrackScale: FC = () => {

    const {trackWidth} = useContext(ScaleDisplayContext);

    return (
        <div className="track-scale">
            <span className="track-scale-line" style={{width: trackWidth}}>
                0ms &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                |100ms &nbsp;&nbsp;&nbsp;
                |200ms &nbsp;&nbsp;&nbsp;
                |300ms &nbsp;&nbsp;&nbsp;
                |400ms &nbsp;&nbsp;&nbsp;
                |500ms &nbsp;&nbsp;&nbsp;
                |600ms &nbsp;&nbsp;&nbsp;
                |700ms &nbsp;&nbsp;&nbsp;
                |800ms &nbsp;&nbsp;&nbsp;
                |etc
            </span>
        </div>
    )

}