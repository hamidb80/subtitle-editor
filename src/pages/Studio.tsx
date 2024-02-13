import React, { SyntheticEvent } from 'react'
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable'
import hotkeys from 'hotkeys-js'
import { v4 as uuid } from "uuid"

import appStates from "../utils/states"
import { simpleSort } from "../utils/funcs"
import { Caption, export2srt, captionsCompare } from "../utils/caption"
import { SHOOT_TIME_MINOR, SHOOT_TIME_MAJOR, MAX_HISTORY, DEFAULT_SCALE } from "../utils/consts"

import { VideoPlayer, Timeline, SubtitleTimeline, CaptionEditor, CaptionView } from "../components/video"
import { CircleBtn, pushToast } from "../components/form"

import WaveSurfer from 'wavesurfer.js'


import fileDownload from 'js-file-download'

import "./studio.sass"


function copyReplace<T>(arr: T[], i: number, repl: T): T[] {
  return Object.assign([], arr, { [i]: repl })
}

export default class Studio extends React.Component<{}, {
  videoUrl: string
  videoHeight: number
  acc: number
  
  subFileName: string

  currentTime: number
  totalTime: number

  captions: Caption[]
  selected_caption_i: number | null
  
  history: Caption[][]
  historyCursor: number
  
  scale: number
}> {

  VideoPlayerRef: React.RefObject<VideoPlayer>
  subtitleTimelineRef: React.RefObject<SubtitleTimeline>
  // @ts-ignore
  ws: WaveSurfer

  constructor(props: any) {
    super(props)

    this.state = {
      videoUrl: appStates.videoUrl.getData() || "https://as8.asset.aparat.com/aparat-video/c0abed25946d273ab38fbd2274df6c6d6957437-360p.mp4?wmsAuthSign=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IjY3NTZjNjJiZjYwMDIyNjUzMjc5OTM0ZWYxMmY5OGM5IiwiZXhwIjoxNzA3ODYxNTg3LCJpc3MiOiJTYWJhIElkZWEgR1NJRyJ9.QatHrg3GFqNI4KOeucQrY61Z-lEdrsKaLxlSTDVT2cE",
      videoHeight: 400,
      acc: 0,

      currentTime: 0,
      totalTime: 0,

      subFileName: "subtitle.srt",

      captions: [],
      selected_caption_i: null,

      historyCursor: -1,
      history: [],
      
      scale: DEFAULT_SCALE,
    }

    this.subtitleTimelineRef = React.createRef()
    this.VideoPlayerRef = React.createRef()

    // --- bind methods ---
    this.onTimeUpdate = this.onTimeUpdate.bind(this)
    this.onVideoError = this.onVideoError.bind(this)
    this.onVideoLoad = this.onVideoLoad.bind(this)
    this.handleSeparatorDrag = this.handleSeparatorDrag.bind(this)
    this.handleSeparatorStop = this.handleSeparatorStop.bind(this)
    this.onScaleChanged = this.onScaleChanged.bind(this)

    this.addCaptionUIHandler = this.addCaptionUIHandler.bind(this)
    this.changeCaptionUIHandler = this.changeCaptionUIHandler.bind(this)
    this.changeCaptionObject = this.changeCaptionObject.bind(this)
    this.deleteCaptionUIHandler = this.deleteCaptionUIHandler.bind(this)
    this.deleteCaptionObject = this.deleteCaptionObject.bind(this)
    this.captionSelectionToggle = this.captionSelectionToggle.bind(this)

    this.updatedHistory = this.updatedHistory.bind(this)
    this.undoRedo = this.undoRedo.bind(this)

    this.goToLastStart = this.goToLastStart.bind(this)
    this.goToNextEnd = this.goToNextEnd.bind(this)

    this.saveFile = this.saveFile.bind(this)
  }

  // ------------- component API -----------------

  componentDidMount() {
    // --- init states ---
    const initCaps = appStates.subtitles.getData()
    this.setState({
      captions: initCaps,
      ...this.updatedHistory(initCaps)
    })

    // --- bind shortcuts ---
    hotkeys.filter = () => true // to make it work also in input elements

    hotkeys('alt+*, tab, shift+tab', kv => kv.preventDefault())

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
    hotkeys('ctrl+6', kv => {
      kv.preventDefault()
      this.goToLastStart()
    })
    hotkeys('ctrl+7', kv => {
      kv.preventDefault()
      this.goToNextEnd()
    })
    hotkeys('ctrl+left', kv => {
      kv.preventDefault()
      this.VideoPlayerRef.current?.shootTime(-SHOOT_TIME_MINOR)
    })
    hotkeys('ctrl+right', kv => {
      kv.preventDefault()
      this.VideoPlayerRef.current?.shootTime(+SHOOT_TIME_MINOR)
    })

    hotkeys('ctrl+enter', () => this.addCaptionUIHandler())

    hotkeys('ctrl+down', kv => {
      kv.preventDefault()

      const t = this.state.currentTime,
        i = this.state.captions.findIndex(c => t >= c.start && t <= c.end)

      if (i !== -1)
        this.setState({ selected_caption_i: i })
    })
    hotkeys('escape', _ => {
        this.setState({ selected_caption_i: null })
    })

    hotkeys('space', kv => {
      // @ts-ignore
      if (kv.target.tagName !== 'INPUT')
        kv.preventDefault()
    })
    hotkeys('ctrl+space', _ => {
      this.VideoPlayerRef.current?.togglePlay()
    })

    hotkeys('ctrl+delete', () => this.deleteCaptionUIHandler())

    hotkeys('ctrl+z', () => this.undoRedo(true))
    hotkeys('ctrl+y', () => this.undoRedo(false))
    hotkeys('ctrl+s', kv => {
      kv.preventDefault()
      this.saveFile()
    })
  }
  componentWillUnmount() {
    hotkeys.unbind()
  }

  // ----------- video player events -------------------

  onVideoLoad(){
    let c = document.getElementById("sound-wave")!
    let v = document.querySelector('video')!
    
    this.ws = WaveSurfer.create({
      container: c,
      waveColor: 'rgb(200, 0, 200)',
      progressColor: 'rgb(100, 0, 100)',
      media: v,
      interact: false,
      height: 30,
    }) 

    this.ws.on("ready", () => {
      this.ws.zoom(this.state.scale)
    });
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

  onVideoError(_: SyntheticEvent) {
    pushToast({
      kind: 'danger',
      message: "error happend while loading video",
      duration: 5000
    })
  }

  onScaleChanged(scale: number) {
    this.setState({scale})
    this.ws.zoom(scale)
  }

  // ----------------- functionalities --------------------
  // -- captions changes

  changeCaptionObject(index: number, newcap: Caption): Caption[] {
    return copyReplace(
      this.state.captions,
      index,
      { ...newcap, hash: uuid() })
  }
  deleteCaptionObject(selected_i: number): Caption[] {
    let
      copy = [...this.state.captions],
      lastIndex = copy.length - 1

    if (selected_i !== lastIndex)
      copy[selected_i] = copy[lastIndex]

    copy.pop()

    return copy
  }

  addCaptionUIHandler() {
    let
      ct = this.state.currentTime,
      currentCap = this.state.captions.find(c => (ct >= c.start) && (ct <= c.end)),
      t = currentCap && (currentCap.end - ct < 0.6) ? currentCap.end + 0.001 : ct,
      newCap = {
        start: t,
        end: t + 1,
        content: "New Caption",
        hash: uuid(),
      },
      caps = this.state.captions.concat(newCap)

    this.setState({
      captions: caps,
      selected_caption_i: this.state.captions.length,
      ...this.updatedHistory(caps),
    })
  }
  changeCaptionUIHandler(index: number, newCap: Caption) {
    if (index < 0 || index >= this.state.captions.length) return // it can happen due to fast repeative user actions

    let caps = this.changeCaptionObject(index, newCap)

    this.setState({
      captions: caps,
      ...this.updatedHistory(caps),
    })
  }
  deleteCaptionUIHandler() {
    if (this.state.selected_caption_i === null) return

    let caps = this.deleteCaptionObject(this.state.selected_caption_i)

    this.setState({
      selected_caption_i: null,
      captions: caps,
      ...this.updatedHistory(caps),
    })
  }

  updatedHistory(caps: Caption[]): object {
    let
      h = this.state.history,
      li = h.length - 1, // last index
      c = this.state.historyCursor

    if (c < li)
      h = [...h.slice(0, c + 1), caps]
    else
      h = [...h, caps]

    h = h.slice(-MAX_HISTORY)

    return {
      historyCursor: h.length - 1,
      history: h
    }
  }
  undoRedo(undo: boolean) {
    const
      hc = this.state.historyCursor,
      history = this.state.history,
      dir = (undo ? -1 : +1)

    // out of range check
    if (hc + dir < -1 || hc + dir >= history.length) return

    this.setState({
      selected_caption_i: null,
      captions: this.state.history[hc + (undo ? 0 : +1)],
      historyCursor: hc + dir,
    })
  }

  // -- caption selection

  captionSelectionToggle(index: number | null) {
    this.setState({
      selected_caption_i:
        this.state.selected_caption_i === index ? null : index
    })
  }

  goToNextEnd() {
    // TODO optimize
    const
      ls = this.state,
      ends = ls.captions
        .filter(c => ls.currentTime < c.end)
        .map(c => c.end)
        .sort(simpleSort)

    if (ends.length)
      this.VideoPlayerRef.current?.setTime(ends[0])
  }

  goToLastStart() {
    const
      ls = this.state,
      starts = ls.captions
        .filter(c => ls.currentTime > c.start)
        .map(c => c.start)
        .sort(simpleSort)

    if (starts.length)
      this.VideoPlayerRef.current?.setTime(starts[starts.length - 1])
  }

  saveFile() {
    this.state.captions.sort(captionsCompare)
    fileDownload(export2srt(this.state.captions), this.state.subFileName)
  }

  // handleSeparatorStop(_: DraggableEvent, _: DraggableData) {
  handleSeparatorStop() {
    this.setState({
      videoHeight: this.state.videoHeight + this.state.acc,
      acc: 0,
    })
  }
  handleSeparatorDrag(_: DraggableEvent, dd: DraggableData) {
    this.setState({ acc: this.state.acc + dd.deltaY })
  }

  render() {
    const
      caps = this.state.captions,
      selected_ci = this.state.selected_caption_i

    return (<>
      <h2 className="page-title">Studio</h2>
      <div className="wrapper">

        <div className="video-wrapper">
          <VideoPlayer
            ref={this.VideoPlayerRef}
            videoUrl={this.state.videoUrl}
            onTimeUpdate={this.onTimeUpdate}
            onError={this.onVideoError}
            height={this.state.videoHeight}
            onDurationChanges={du => this.setState({ totalTime: du })}
            onLoad={this.onVideoLoad}
          />
        </div>

        <Draggable
          axis="y"
          position={{ x: 0, y: 0 }}
          onDrag={this.handleSeparatorDrag}
          onStop={this.handleSeparatorStop}
        >
          <div className="separator mt-3"></div>
        </Draggable>

        <CaptionView
          currentTime={this.state.currentTime}
          captions={caps}
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
            onClick={this.addCaptionUIHandler}
          />
          <CircleBtn
            iconClassName="fas fa-undo"
            disabled={this.state.historyCursor === -1}
            text={"undo " + (this.state.historyCursor + 1)}
            onClick={() => this.undoRedo(true)}
          />

          <CircleBtn
            iconClassName="fas fa-redo"
            text={"redo " + ((this.state.history.length - 1) - this.state.historyCursor)}
            disabled={this.state.historyCursor >= this.state.history.length - 1}
            onClick={() => this.undoRedo(false)}
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
            onClick={this.deleteCaptionUIHandler}
          />

          <CircleBtn
            iconClassName="fas fa-chevron-left"
            disabled={caps.length === 0}
            text="last start"
            onClick={this.goToLastStart}
          />
          <CircleBtn
            iconClassName="fas fa-chevron-right"
            disabled={caps.length === 0}
            text="next end "
            onClick={this.goToNextEnd}
          />

        </div>

        <SubtitleTimeline
          ref ={this.subtitleTimelineRef}
          className="my-1"
          duration={this.state.totalTime}
          currentTime={this.state.currentTime}
          onSelectNewTime={nt => this.VideoPlayerRef.current?.setTime(nt)}
          scale={this.state.scale}
          captions={caps}
          onCaptionSelected={this.captionSelectionToggle}
          selectedCaption_i={selected_ci}
          onCaptionChanged={this.changeCaptionUIHandler}
          onScaleChanged={this.onScaleChanged}
        />

        <CaptionEditor
          currentTime={this.state.currentTime}
          totalTime={this.state.totalTime}
          caption={selected_ci === null ? null : caps[selected_ci]}
          captionIndex={selected_ci === null ? -1 : selected_ci}
          onCaptionChanged={this.changeCaptionUIHandler}
        />

      </div>

      <div className="d-flex justify-content-center my-2 download-form">
        <input className="form-control" placeholder="file-name.srt" 
          value={this.state.subFileName} 
          onChange={ e => this.setState({subFileName: e.currentTarget.value})}  />
        <button className="btn btn-danger" onClick={this.saveFile}>
          <strong> save as a file <span className="fas fa-file"></span>  </strong>
        </button>
      </div>
    </>)
  }
}