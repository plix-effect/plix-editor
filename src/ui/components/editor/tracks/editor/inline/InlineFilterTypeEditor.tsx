import React, {
    FC,
    useCallback,
    useContext,
    useMemo,
} from "react";
import {
    InlineSelectEditor,
    InlineSelectOptionGroup,
    InlineSelectOptionValue
} from "./InlineSelectEditor";
import {
    PlixFilterAliasJsonData,
    PlixFilterJsonData
} from "@plix-effect/core/dist/types/parser";
import {ParseMeta} from "../../../../../types/ParseMeta";
import {TrackContext} from "../../../TrackContext";
import {ConstructorContext} from "../../../ConstructorContext";

interface FilterInlineSelectOptionValue extends InlineSelectOptionValue {
    filterType: null|"ALIAS"|"CONSTRUCTOR"
}
interface FilterInlineSelectOptionGroup extends InlineSelectOptionGroup {
    options: FilterInlineSelectOptionValue[]
}
type FilterInlineSelectOption = FilterInlineSelectOptionValue|FilterInlineSelectOptionGroup

const NO_FILTER_OPTION:FilterInlineSelectOptionValue = (
    {
        type: "value",
        value: "X",
        label: "(no-filter)",
        filterType: null
    }
)

export interface InlineSelectEditorProps {
    filter: PlixFilterJsonData
    onChange: (type: null|"alias"|"constructor", value?: string) => void
}

export const InlineFilterTypeEditor: FC<InlineSelectEditorProps> = ({filter, onChange}) => {

    const handleChange = useCallback((option: FilterInlineSelectOptionValue) => {
        const type = option.filterType;
        const value = option.value.substr(1);
        if (type === null) return onChange(null);
        if (type === "ALIAS") return onChange("alias", value);
        if (type === "CONSTRUCTOR") return onChange("constructor", value);
    }, []);

    const {track: { filters: filterAliasMap }} = useContext(TrackContext);
    const {filterConstructorMap} = useContext(ConstructorContext);

    const filterConstructorsData = useMemo(() => {
        return Object.keys(filterConstructorMap).sort(/*a-z*/).map((id) => {
            const filterConstructor = filterConstructorMap[id];
            const meta: ParseMeta = filterConstructor['meta'];
            return {
                name: meta.name,
                value: id,
            };
        });
    }, [filterConstructorMap]);

    const aliasData = useMemo(() => {
        return Object.keys(filterAliasMap).sort(/*a-z*/).map((name) => {
            return {
                name: name,
                value: name,
            };
        });
    }, [filterAliasMap]);

    const options: FilterInlineSelectOption[] = useMemo(() => {
        const res: FilterInlineSelectOption[] = [
            NO_FILTER_OPTION,
            {
                type: "group",
                label: "aliases",
                options: aliasData.map(data => (
                    {
                        type: "value",
                        value: "A"+data.value,
                        label: <span><i className="fa fa-link"/> {data.name}</span>,
                        filterType: "ALIAS"
                    }
                ))
            },
            {
                type: "group",
                label: "basic effects",
                options: filterConstructorsData.map(data => (
                    {
                        type: "value",
                        value: "C"+data.value,
                        label: data.name,
                        filterType: "CONSTRUCTOR"
                    }
                ))
            }
        ];
        return res;
    }, [])

    const currentValue = useMemo<FilterInlineSelectOptionValue>(() => {
        if (filter == null) {
            return NO_FILTER_OPTION
        } else {
            if (filter[1] == null) { // Alias
                const alias = filter as PlixFilterAliasJsonData;
                return {
                    value: "A"+alias[2],
                    label: <span><i className="fa fa-link"/> {alias[2]}</span>,
                    filterType: "ALIAS",
                    type: "value"
                }
            } else if (filter[1] !== null) {
                return {
                    value: "C"+filter[1],
                    label: filter[1],
                    filterType: "CONSTRUCTOR",
                    type: "value"
                }
            }
        }
    }, [filter, options])

    return (
        <InlineSelectEditor
            value={currentValue}
            options={options}
            onChange={handleChange}
            emptyText={"(no-filter)"}
        />
    );
}