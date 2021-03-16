import React from 'react'
import { Link, Redirect } from "react-router-dom"

import { FileInput, pushToast } from "../components/form"
import appStates from "../utils/states"
import { parseSrt } from "../utils/caption"

import "./intro.sass"

type State = {
  subtitleUrl: string
  videoUrl: string
  canPass: boolean
}
export default class Intro extends React.Component<{}, State> {
  constructor(props: any) {
    super(props)
    this.state = {
      subtitleUrl: '',
      videoUrl: '',
      canPass: false,
    }

    this.handler = this.handler.bind(this)
    this.loadCaptions = this.loadCaptions.bind(this)
    this.checkValidation = this.checkValidation.bind(this)
  }

  async loadCaptions() {
    if (this.state.subtitleUrl === '')
      return

    const response = await fetch(this.state.subtitleUrl),
      data = await response.text()

    appStates.subtitles.setData(parseSrt(data))
  }

  handler(f: File, fileType: "video" | "subtitle") {
    const blob = URL.createObjectURL(f)

    if (fileType === 'video') {
      appStates.videoUrl.setData(blob)
      this.setState({ videoUrl: blob }, this.loadCaptions)
    }
    else
      this.setState({ subtitleUrl: blob }, this.loadCaptions)
  }

  checkValidation() {
    if (this.state.videoUrl)
      this.setState({ canPass: true })

    else
      pushToast({
        kind: 'danger', 
        message: "select a video first",
         duration: 5000
      })
  }

  render() {
    if (this.state.canPass)
      return <Redirect to="/studio" />

    return (<>
      <h2 className="page-title" >Intro</h2>
      <div className="wrapper">

        <div className="alert alert-secondary">
          consider‌ <Link to="/help">‌help page‌</Link> for learning app features & shortcuts
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
          <button className="btn btn-success font-weight-bold" onClick={this.checkValidation}>
            go to studio!
          </button>
        </div>

      </div>

      <footer className="p-2 w-100 d-flex justify-content-center">
        <a href="https://github.com/hamidb80/subtitle-edtior/" target="blank"
          className="d-flex align-items-center">
          <span className="fab fa-github github-logo"></span>
          <span className="pb-1 mx-2"> project link on github </span>
        </a>
      </footer>
    </>)
  }
}
