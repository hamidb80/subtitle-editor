import React from 'react'
import appStates from "../utils/states"
import { VideoPlayer } from "../components/video"

import "../styles/pages/studio.sass"


class Intro extends React.Component {
  state: {
    videoUrl: string
    subtitle_object: any
  }

  constructor(props: any) {
    super(props)
    this.state = {
      videoUrl: appStates.videoFile.getData(),
      subtitle_object: {}
    }
  }

  render() {
    return (<>
      <h2 className="page-title" >Studio</h2>
      <div className="wrapper">

        <div className="video-wrapper">
          <VideoPlayer videoUrl={this.state.videoUrl}></VideoPlayer>
        </div>


      </div></>
    )
  }
}

export default Intro