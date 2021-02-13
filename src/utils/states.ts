import { WindowStates } from "./storage"
import { Caption } from "./caption"

const obj = {
  videoUrl: new WindowStates<string>(''),
  subtitles: new WindowStates<Caption[]>([])
}

export default obj