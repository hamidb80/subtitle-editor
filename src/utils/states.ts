import { WindowStates } from "./storage"

const videoState = new WindowStates<string>('')
    ,subtitleState = new WindowStates<string>('')

export default {
    videoUrl: videoState,
    subtitleUrl: subtitleState
}