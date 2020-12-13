import React, {FC, useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import "./PlixLibBlock.scss";
import {TrackContext} from "./TrackContext";
import {PlixFilterJsonData, PlixProfile} from "@plix-effect/core/types/parser";
import {PlixEffectJsonData} from "@plix-effect/core/dist/types/parser";
import useLatestCallback from "../../use/useLatestCallback";

interface ResultMap {
    effect: PlixEffectJsonData
    filter: PlixFilterJsonData
    profile: PlixProfile
}
type SearchResults = {
    [key in keyof ResultMap]: {
        type: key
        accuracy: number
        name: string
        value: ResultMap[key]
    }
}
type SearchResult = SearchResults[keyof ResultMap]

export const PlixLibBlock: FC = () => {

    const {track} = useContext(TrackContext);

    const searchRef = useRef<HTMLInputElement>()
    const [type, setType] = useState("all");
    const [text, setText] = useState("");

    const searchWithType = useCallback((type) => {
        console.log("searchWithType", type);
        searchRef.current.focus();
        searchRef.current.select();
        if (type) setType(type);
    }, []);

    useEffect(() => {
        const onKeyDown = (event: DocumentEventMap["keydown"]) => {
            console.log("EE", event);
            const {code, ctrlKey, shiftKey, altKey} = event;
            if (code === "KeyF" && ctrlKey && !shiftKey && !altKey) {
                event.preventDefault();
                return searchWithType("all");
            }
            if (code === "KeyF" && ctrlKey && shiftKey && !altKey) {
                event.preventDefault();
                return searchWithType("filters");
            }
            if (code === "KeyE" && ctrlKey && shiftKey && !altKey) {
                event.preventDefault();
                return searchWithType("effects");
            }
            if (code === "KeyP" && ctrlKey && shiftKey && !altKey) {
                event.preventDefault();
                return searchWithType("profiles");
            }
        }
        const captureEvent = {capture: true};
        window.addEventListener("keydown", onKeyDown, captureEvent);
        return () => window.removeEventListener("keydown", onKeyDown, captureEvent)
    }, [])

    const onChangeOption = useCallback((event) => {
        setType(event.target.value);
        searchRef.current.focus();
        searchRef.current.select();
    }, [setType]);

    const onChangeText = useCallback((event) => {
        setText(event.target.value);
    }, [setType]);

    const searchResults = useMemo<SearchResult[]>(() => {
        if (!text) return [];
        const lText = text.toLowerCase();
        const results: SearchResult[] = [];
        if (type === "all" || type === "effects") for (const name of Object.keys(track.effects)) {
            const lName = name.toLowerCase();
            let accuracy = 0;
            if (lName === lText) accuracy = 100;
            if (lName.startsWith(lText)) accuracy = 10;
            if (lName.indexOf(lText) > 0) accuracy = 1;
            if (accuracy === 0) continue
            results.push({type: "effect", accuracy, name: name, value: track.effects[name]});
        }
        if (type === "all" || type === "filters") for (const name of Object.keys(track.filters)) {
            const lName = name.toLowerCase();
            let accuracy = 0;
            if (lName === lText) accuracy = 100;
            if (lName.startsWith(lText)) accuracy = 10;
            if (lName.indexOf(lText) > 0) accuracy = 1;
            if (accuracy === 0) continue
            results.push({type: "filter", accuracy, name: name, value: track.filters[name]});
        }
        if (type === "all" || type === "profiles") for (const name of Object.keys(track.profiles)) {
            const lName = name.toLowerCase();
            let accuracy = 0;
            if (lName === lText) accuracy = 100;
            if (lName.startsWith(lText)) accuracy = 10;
            if (lName.indexOf(lText) > 0) accuracy = 1;
            if (accuracy === 0) continue
            results.push({type: "profile", accuracy, name: name, value: track.profiles[name]});
        }
        results.sort((r1, r2) => {
            if (r1.accuracy > r2.accuracy) return -1;
            if (r1.accuracy < r2.accuracy) return 1;
            if (r1.name > r2.name) return 1;
            if (r1.name < r2.name) return -1;
            return 0;
        })
        return results;
    }, [type, text, track])

    return (
        <div className="plix-lib-block">
            <div className="plix-lib-search">
                <input type="search" ref={searchRef} placeholder="search" value={text} onChange={onChangeText}/>
                <select onChange={onChangeOption} value={type}>
                    <option value="all" title="Ctrl+F">all</option>
                    <option value="effects" title="Ctrl+Shift+E">effects</option>
                    <option value="filters" title="Ctrl+Shift+F">filters</option>
                    <option value="profiles" title="Ctrl+Shift+P">profiles</option>
                </select>
            </div>
            <div className="plix-lib-result">
                {searchResults.map((result) => (
                    <PlixLibResult value={result} key={result.type+result.name}/>
                ))}
            </div>
        </div>
    )
}

const PlixLibResult: FC<{value: SearchResult}> = ({value}) => {
    switch (value.type) {
        case "effect": return <PlixLibResultEffect value={value} />
        case "filter": return <PlixLibResultFilter value={value} />
        case "profile": return <PlixLibResultProfile value={value} />
    }
    return null;
}
const PlixLibResultEffect: FC<{value: SearchResults['effect']}> = ({value}) => {
    return (
        <div>
            {value.name}
        </div>
    );
}
const PlixLibResultFilter: FC<{value: SearchResults['filter']}> = ({value}) => {
    return (
        <div>
            {value.name}
        </div>
    );
}
const PlixLibResultProfile: FC<{value: SearchResults['profile']}> = ({value}) => {
    return (
        <div>
            {value.name}
        </div>
    );
}