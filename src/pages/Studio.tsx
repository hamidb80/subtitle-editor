import React from 'react'
import hotkeys from 'hotkeys-js'

import appStates from "../utils/states"
import { Caption, export2srt } from "../utils/caption"
import { SHOOT_TIME_MINOR, SHOOT_TIME_MAJOR, MAX_HISTORY } from "../utils/consts"

import { VideoPlayer, Timeline, SubtitleTimeline, CaptionEditor, CaptionView } from "../components/video"
import { CircleBtn } from "../components/form"

import "./studio.sass"

const fileDownload = require('js-file-download')


let capsHistory: string[] = []

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
    this.clearCaptions = this.clearCaptions.bind(this)

    this.captureLastStates = this.captureLastStates.bind(this)
    this.undo = this.undo.bind(this)

    this.saveFile = this.saveFile.bind(this)
  }

  componentDidMount() {
    this.setState({captions: appStates.subtitles.getData()})

    hotkeys.filter = () => true // to make it work also in input elements

    hotkeys('alt+*,tab', kv => { kv.preventDefault() })

    hotkeys('ctrl+shift+left', kv => {
      if (this.state.selected_caption_i === null) {
        kv.preventDefault()
        this.VideoPlayerRef.current?.shootTime(-SHOOT_TIME_MAJOR)
      }
    })
    hotkeys('ctrl+shift+right', kv => {
      if (this.state.selected_caption_i === null) {
        kv.preventDefault()
        this.VideoPlayerRef.current?.shootTime(+SHOOT_TIME_MAJOR)
      }
    })
    hotkeys('ctrl+left', kv => {
      if (this.state.selected_caption_i === null) {
        kv.preventDefault()
        this.VideoPlayerRef.current?.shootTime(-SHOOT_TIME_MINOR)
      }
    })
    hotkeys('ctrl+right', kv => {
      if (this.state.selected_caption_i === null) {
        kv.preventDefault()
        this.VideoPlayerRef.current?.shootTime(+SHOOT_TIME_MINOR)
      }
    })

    hotkeys('ctrl+enter', this.addCaption)

    hotkeys('ctrl+down', kv => {
      kv.preventDefault()

      const t = this.state.currentTime,
        i = this.state.captions.findIndex(c => t >= c.start && t <= c.end)

      if (i !== -1)
        this.setState({ selected_caption_i: i })
    })
    hotkeys('ctrl+up, escape', kv => {
      kv.preventDefault()
      this.setState({ selected_caption_i: null })
    })

    hotkeys('space', kv => {
      // @ts-ignore
      if (kv.target.tagName !== 'INPUT')
        kv.preventDefault()
    })
    hotkeys('ctrl+space', kv => {
      this.VideoPlayerRef.current?.togglePlay()
    })

    hotkeys('ctrl+delete', this.onCaptionDeleted)

    hotkeys('ctrl+z', this.undo)
    hotkeys('ctrl+s', kv => {
      kv.preventDefault()
      this.saveFile()
    })
  }
  componentWillUnmount() {
    hotkeys.unbind()
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
    // TODO: check hash key 
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
  clearCaptions() {
    this.captureLastStates()
    this.setState({ captions: [], selected_caption_i: null })
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
    fileDownload(export2srt(this.state.captions), 'subtitle.srt');
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
            onClick={this.onCaptionDeleted}
          />

          <CircleBtn
            iconClassName="fas fa-broom"
            text="clear timeline"
            disabled={this.state.captions.length === 0}
            onClick={this.clearCaptions}
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