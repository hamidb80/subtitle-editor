import { WindowStates } from "./storage"

const videoState = new WindowStates<string>('')
    ,subtitleState = new WindowStates<string>('')

export default {
    videoFile: videoState,
    subtitleFile: subtitleState
}