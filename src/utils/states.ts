import { WindowStates } from "./storage"

export default {
    videoUrl: new WindowStates<string>(''),
    subtitleUrl: new WindowStates<string>('')
}