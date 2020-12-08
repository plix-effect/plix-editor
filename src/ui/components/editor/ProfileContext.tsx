import React, {
    createContext,
    memo,
    ReactNode,
    useContext,
    useMemo,
    useState
} from "react";
import type {PlixJsonData, PlixProfile} from "@plix-effect/core/types/parser";

const ProfileNameContext = createContext<readonly [string|null, (value: string) => void]>([null, () => {}]);
const ProfileContext = createContext<PlixProfile|null>(null);

export interface SelectProfileProviderProps {
    track: PlixJsonData;
    children: ReactNode
}
export const SelectProvider = memo<SelectProfileProviderProps>(({track, children}) => {

    const [profileName, setProfileName] = useState<string|null>(null);
    const profileMap = track.profiles ?? {};
    const profile = profileMap[profileName] ?? null;
    const actualProfileName = profile ? profileName : null;

    const profileNameCtxValue = useMemo(() => [actualProfileName, (v:string) => setProfileName(v)] as const, [actualProfileName])

    return (
        <ProfileNameContext.Provider value={profileNameCtxValue}>
            <ProfileContext.Provider value={profile}>
               {children}
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