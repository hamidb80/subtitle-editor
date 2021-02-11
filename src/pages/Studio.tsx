import React from 'react'

import appStates from "../utils/states"
import { Caption, captionsToFileString } from "../utils/types"
import { timestamp2seconds } from "../utils/timestamp"

import { VideoPlayer, Timeline, SubtitleTimeline, CaptionEditor, CaptionView } from "../components/video"
import { CircleBtn } from "../components/form"

import "../styles/pages/studio.sass"

const fileDownload = require('js-file-download');

class Intro extends React.Component {
  state: {
    videoUrl: string

    currentTime: number
    totalTime: number

    captions: Caption[]
    selected_caption_i: null | number
  }

  VideoPlayerRef: React.RefObject<VideoPlayer>

  constructor(props: any) {
    super(props)

    this.state = {
      videoUrl: appStates.videoUrl.getData(),

      currentTime: 0,
      totalTime: 0,

      captions: [],
      selected_caption_i: null,
    }

    this.VideoPlayerRef = React.createRef()

    // --- bind methods ---
    this.addCaption = this.addCaption.bind(this)
    this.onChangeCaption = this.onChangeCaption.bind(this)
    this.onCaptionDeleted = this.onCaptionDeleted.bind(this)

    this.loadCaptions = this.loadCaptions.bind(this)
    this.saveFile = this.saveFile.bind(this)
  }

  async loadCaptions() {
    const response = await fetch(appStates.subtitleUrl.getData()),
      data = await response.text(),
      matches = Array.from(data.matchAll(/([\d,:]{12}) --> ([\d,:]{12})\n(.*)(?![\d,:]{12})/g)),

      caps: Caption[] = matches.map(m => ({
        start: timestamp2seconds(m[1]),
        end: timestamp2seconds(m[2]),
        content: m[3]
      }))

    this.setState({ captions: caps })
  }

  componentDidMount() {
    setTimeout(this.loadCaptions, 1000)
  }

  addCaption() {
    const newCaps = this.state.captions

    newCaps.push({
      start: this.state.currentTime,
      end: this.state.currentTime + 1,
      content: "New Caption"
    })

    this.setState({
      captions: newCaps,
      selected_caption_i: newCaps.length - 1,
    })
  }
  onChangeCaption(ind: number, c: Caption) {
    const caps = this.state.captions
    caps[ind] = c

    this.setState({ captions: caps })
  }
  onCaptionDeleted(ind: number) {
    const caps = this.state.captions
    caps.splice(ind, 1)

    this.setState({ captions: caps, selected_caption_i: null })
  }

  undo() { } // TODO

  saveFile() {
    fileDownload(captionsToFileString(this.state.captions), 'subtitle.srt');
  }

  render() {
    return (<>
      <h2 className="page-title" >Studio</h2>
      <div className="wrapper">

        <div className="video-wrapper">
          <VideoPlayer
            ref={this.VideoPlayerRef}
            videoUrl={this.state.videoUrl}
            onTimeUpdate={nt => this.setState({ currentTime: nt })}
            onDurationChanges={du => this.setState({ totalTime: du })}
          />
        </div>

        <CaptionView
          currentTime={this.state.currentTime}
          captions={this.state.captions}
        />
        <Timeline
          className="my-2"
          currentTime={this.state.currentTime}
          totalTime={this.state.totalTime}
          onSelectNewTime={nt => this.VideoPlayerRef.current?.setTime(nt)}
        />

        <div className="d-flex justify-content-center action-button-group my-2">
          <CircleBtn
            iconClassName="fas fa-plus"
            text="add caption"
            onClick={this.addCaption}
          />
          <CircleBtn
            iconClassName="fas fa-undo"
            text="undo"
            onClick={this.undo}
          />
        </div>

        <SubtitleTimeline
          className="my-1"
          duration={this.state.totalTime}
          currentTime={this.state.currentTime}
          onSelectNewTime={nt => this.VideoPlayerRef.current?.setTime(nt)}

          captions={this.state.captions}
          onCaptionSelected={id => { // toggle selection
            this.setState({ selected_caption_i: (this.state.selected_caption_i === id ? null : id) })
          }}
          selectedCaption_i={this.state.selected_caption_i}
        />

        <CaptionEditor
          currentTime={this.state.currentTime}
          replayTimeRange={() => { }} // TODO

          captions={this.state.captions}
          selectedCaption_i={this.state.selected_caption_i}
          onCaptionChanged={this.onChangeCaption}
          onCaptionDeleted={this.onCaptionDeleted}
        />

      </div>

      <div className="d-flex justify-content-center my-2">
        <button className="btn btn-danger" onClick={this.saveFile}>
          <strong>save as a file <span className="fas fa-file"></span>  </strong>
        </button>
      </div>
    </>)
  }
}

export default Intro