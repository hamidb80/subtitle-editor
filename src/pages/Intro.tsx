import React from 'react'
import { Link } from "react-router-dom"

import FileInput from "../components/form/FileInput"
import appStates from "../utils/states"
import { parseSrt } from "../utils/caption"

class Intro extends React.Component {
  state: { subtitleUrl: string }

  constructor(props: any) {
    super(props)
    this.state = { subtitleUrl: '' }

    this.handler = this.handler.bind(this)
    this.loadCaptions = this.loadCaptions.bind(this)
  }

  async loadCaptions() {
    if (this.state.subtitleUrl === '')
      return

    const response = await fetch(this.state.subtitleUrl),
      data = await response.text()

    // TODO check for error or emptiness
    appStates.subtitles.setData(parseSrt(data))
  }

  // TODO check something is selected of not
  handler(f: File, fileType: "video" | "subtitle") {
    const blob = URL.createObjectURL(f)

    if (fileType === 'video')
      appStates.videoUrl.setData(blob)
    else
      this.setState({ subtitleUrl: blob }, this.loadCaptions)
  }

  render() {
    return (<>
      <h2 className="page-title" >Intro</h2>
      <div className="wrapper">

        <div className="alert alert-secondary">
          consider‌ <Link to="/help">‌help page‌</Link> for learning shortcuts
        </div>
        <div>
          <span>video file:</span>
          <FileInput onChange={f => this.handler(f, 'video')} />
        </div>

        <div className="alert alert-info">
          you can check supported video formats
        <a href="https://en.wikipedia.org/wiki/HTML5_video" target="blank"> here </a>
        </div>

        <div className="mt-3">
          <span>subtitle file:</span>
          <FileInput onChange={f => this.handler(f, 'subtitle')} />
        </div>
        <div className="alert alert-warning">
          if you don't select a subtitle file, we make new one
        </div>

        <div className="center">
          <Link to="/studio">
            <button className="btn btn-success font-weight-bold">
              go to studio!
            </button>
          </Link>
        </div>

      </div></>)
  }
}

export default Intro