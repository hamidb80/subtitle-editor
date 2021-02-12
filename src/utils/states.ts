import { WindowStates } from "./storage"

const obj = {
  videoUrl: new WindowStates<string>(''),
  subtitleUrl: new WindowStates<string>('')
}

export default obj