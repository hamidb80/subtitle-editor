import React from 'react'

import appStates from "../utils/states"
import { Caption, captionsToFileString } from "../utils/caption"
import { timestamp2seconds } from "../utils/timestamp"

import { VideoPlayer, Timeline, SubtitleTimeline, CaptionEditor, CaptionView } from "../components/video"
import { CircleBtn } from "../components/form"

import "../styles/pages/studio.sass"

const fileDownload = require('js-file-download')

const MAX_HISTORY = 5
let capsHistory: string[] = []


// TODO add page subscriable key-event and 
class Studio extends React.Component {
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
    this.onTimeUpdate = this.onTimeUpdate.bind(this)

    this.addCaption = this.addCaption.bind(this)
    this.onChangeCaption = this.onChangeCaption.bind(this)
    this.onCaptionDeleted = this.onCaptionDeleted.bind(this)
    this.onCaptionSelected = this.onCaptionSelected.bind(this)


    this.captureLastStates = this.captureLastStates.bind(this)
    this.undo = this.undo.bind(this)

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
        content: m[3].trim()
      }))

    this.setState({ captions: caps })
  }

  componentDidMount() {
    setTimeout(this.loadCaptions, 1000)
  }

  onTimeUpdate(nt: number) { // nt: new time
    const sci = this.state.selected_caption_i
    if (sci !== null) {
      const cap = this.state.captions[sci],
        ve = this.VideoPlayerRef,
        isplying = ve.current?.isPlaying()

      if (nt >= cap.end) {
        if (isplying) {
          ve.current?.setPlay(false)
          ve.current?.setTime(cap.start)
        }
      }
      else if (nt < cap.start) {
        if (isplying)
          ve.current?.setTime(cap.start)
      }
    }

    this.setState({ currentTime: nt })
  }

  addCaption() {
    this.captureLastStates()

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
    this.captureLastStates()

    const caps = this.state.captions
    caps[ind] = c

    this.setState({ captions: caps })
  }
  onCaptionDeleted() {
    if (this.state.selected_caption_i === null)
      return

    this.captureLastStates()

    const caps = this.state.captions
    caps.splice(this.state.selected_caption_i, 1)

    this.setState({
      captions: caps,
      selected_caption_i: null
    })
  }
  onCaptionSelected(id: number) {
    const newState = this.state.selected_caption_i === id ? null : id

    this.setState({ selected_caption_i: newState })
  }

  captureLastStates() {
    const caps = JSON.stringify(this.state.captions)

    if (capsHistory.length > MAX_HISTORY)
      capsHistory = capsHistory.splice(0, 1)

    capsHistory.push(caps)
  }
  undo() {
    if (capsHistory.length > 0)
      this.setState({
        captions: JSON.parse(capsHistory.pop() as string),
        selected_caption_i: null
      })
  }

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
            onTimeUpdate={this.onTimeUpdate}
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
            text={"undo " + capsHistory.length}
            onClick={this.undo}
          />

          <CircleBtn
            iconClassName="fas fa-times"
            disabled={this.state.selected_caption_i === null}
            text="unselect"
            onClick={() => this.setState({ selected_caption_i: null })}
          />

          <CircleBtn
            iconClassName="fas fa-trash"
            disabled={this.state.selected_caption_i === null}
            text="delete"
            onClick={() => this.onCaptionDeleted()}
          />

        </div>

        <SubtitleTimeline
          className="my-1"
          duration={this.state.totalTime}
          currentTime={this.state.currentTime}
          onSelectNewTime={nt => this.VideoPlayerRef.current?.setTime(nt)}

          captions={this.state.captions}
          onCaptionSelected={this.onCaptionSelected}
          selectedCaption_i={this.state.selected_caption_i}
        />

        <CaptionEditor
          currentTime={this.state.currentTime}
          captions={this.state.captions}
          selectedCaption_i={this.state.selected_caption_i}
          onCaptionChanged={this.onChangeCaption}
        />

      </div>

      <div className="d-flex justify-content-center my-2">
        <button className="btn btn-danger" onClick={this.saveFile}>
          <strong> save as a file <span className="fas fa-file"></span>  </strong>
        </button>
      </div>
    </>)
  }
}

export default Studio