import {createContext} from "react";
export interface AudioFileContextProps {
    audioFile: File|null,
    setAudioFile: (file: File|null) => void
}
export const AudioFileContext = createContext<AudioFileContextProps>({audioFile: null, setAudioFile: () => {}})