import React, {
    createContext,
    memo,
    ReactNode,
    useContext,
    useMemo,
    useState
} from "react";
import type {PlixJsonData, PlixProfile} from "@plix-effect/core/types/parser";
import {
    DEFAULT_PREVIEW_FIELD_CONFIG,
    PreviewFieldConfig
} from "../preview/canvas/dynamic/preview-field/PlixCanvasField";

const ProfileNameContext = createContext<readonly [string|null, (value: string) => void]>([null, () => {}]);
const ProfileContext = createContext<PlixProfile|null>(null);
const FieldConfigContext = createContext<PreviewFieldConfig|null>(null);

export interface SelectProfileProviderProps {
    track: PlixJsonData;
    children: ReactNode
}
export const SelectProvider = memo<SelectProfileProviderProps>(({track, children}) => {

    const [profileName, setProfileName] = useState<string|null>(null);
    const profileMap = track.profiles ?? {};
    const profile = profileMap[profileName] ?? null;
    const actualProfileName = profile ? profileName : null;

    const profileNameCtxValue = useMemo(() => [actualProfileName, (v:string) => setProfileName(v)] as const, [actualProfileName]);

    const fieldConfig = useMemo(() => {
        return profile?.['fieldConfig'] ?? track?.['editor']?.['fieldConfig'] ?? DEFAULT_PREVIEW_FIELD_CONFIG;
    }, [profile, track]);

    return (
        <ProfileNameContext.Provider value={profileNameCtxValue}>
            <ProfileContext.Provider value={profile}>
                <FieldConfigContext.Provider value={fieldConfig}>
                   {children}
                </FieldConfigContext.Provider>
            </ProfileContext.Provider>
        </ProfileNameContext.Provider>
    );
});

export function useProfile(): PlixProfile|null{
    return useContext(ProfileContext);
}

export function useProfileName(): readonly [string|null, (value: string) => void]{
    return useContext(ProfileNameContext);
}

export function useFieldConfig(): PreviewFieldConfig {
    return useContext(FieldConfigContext);
}