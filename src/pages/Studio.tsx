import React, { SyntheticEvent } from 'react'
import hotkeys from 'hotkeys-js'
import { v4 as uuid } from "uuid"

import appStates from "../utils/states"
import { simpleSort } from "../utils/funcs"
import { Caption, export2srt, captionsCompare } from "../utils/caption"
import { SHOOT_TIME_MINOR, SHOOT_TIME_MAJOR, MAX_HISTORY } from "../utils/consts"

import { VideoPlayer, Timeline, SubtitleTimeline, CaptionEditor, CaptionView } from "../components/video"
import { CircleBtn, pushToast } from "../components/form"

import "./studio.sass"
const fileDownload = require('js-file-download')

enum ActionTypes { Delete, Create, Change }
type ActionHistory = {
  type: ActionTypes
  changes: Caption[]
}

type State = {
  videoUrl: string

  currentTime: number
  totalTime: number

  captions: Caption[]
  selected_caption_i: number | null

  historyCursor: number
  capsHistory: ActionHistory[] // the last state is always is in the last index
}
export default class Studio extends React.Component<{}, State> {

  VideoPlayerRef: React.RefObject<VideoPlayer>

  constructor(props: any) {
    super(props)

    this.state = {
      videoUrl: appStates.videoUrl.getData(),

      currentTime: 0,
      totalTime: 0,

      captions: [],
      selected_caption_i: null,

      historyCursor: -1,
      capsHistory: []
    }

    this.VideoPlayerRef = React.createRef()

    // --- bind methods ---
    this.onTimeUpdate = this.onTimeUpdate.bind(this)
    this.onVideoError = this.onVideoError.bind(this)

    this.addCaptionUIHandler = this.addCaptionUIHandler.bind(this)
    this.addCaptionObject = this.addCaptionObject.bind(this)
    this.changeCaptionUIHandler = this.changeCaptionUIHandler.bind(this)
    this.changeCaptionObject = this.changeCaptionObject.bind(this)
    this.deleteCaptionUIHandler = this.deleteCaptionUIHandler.bind(this)
    this.deleteCaptionObject = this.deleteCaptionObject.bind(this)
    this.captionSelectionToggle = this.captionSelectionToggle.bind(this)

    this.updateHistory = this.updateHistory.bind(this)
    this.undoRedo = this.undoRedo.bind(this)

    this.goToLastStart = this.goToLastStart.bind(this)
    this.goToNextEnd = this.goToNextEnd.bind(this)

    this.saveFile = this.saveFile.bind(this)
  }

  // ------------- component API -----------------

  componentDidMount() {
    // --- init states ---
    const initCaps = appStates.subtitles.getData()
    this.setState({ captions: initCaps })

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
    hotkeys('escape', kv => {
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

  onVideoError(e: SyntheticEvent) {
    pushToast({
      kind: 'danger',
      message: "error happend while loading video",
      duration: 5000
    })
  }

  // ----------------- functionalities --------------------
  // -- captions changes

  addCaptionObject(newCap: Caption): object {
    return { captions: [...this.state.captions, newCap] }
  }

  addCaptionUIHandler() {
    const
      t = this.state.currentTime,
      newCap = {
        start: t,
        end: t + 1,
        content: "New Caption",
        hash: uuid(),
      }

    const newHistory = {
      type: ActionTypes.Create,
      changes: [newCap,]
    }
    this.setState({
      ...this.addCaptionObject(newCap),
      selected_caption_i: this.state.captions.length

    }, () => this.updateHistory(newHistory))
  }

  changeCaptionObject(fromCap: Caption, toCap: Caption): object {
    return {
      captions: this.state.captions.map(c => c.hash === fromCap.hash ? toCap : c)
    }
  }
  changeCaptionUIHandler(oldCap: Caption, newCap: Caption) {
    const oldCapIndex = this.state.captions.findIndex(c => c.hash === oldCap.hash)
    if (oldCapIndex === -1) return // it can happen due to fast repeative user actions

    const newHistory = {
      type: ActionTypes.Change,
      changes: [oldCap, newCap]
    }

    this.setState(
      this.changeCaptionObject(oldCap, newCap),
      () => this.updateHistory(newHistory))
  }

  deleteCaptionObject(selected_caption_index: number): object {
    return {
      captions: this.state.captions.filter(
        (_, i) => i !== selected_caption_index),
    }
  }

  deleteCaptionUIHandler() {
    const ls = this.state // last state
    if (ls.selected_caption_i === null) return

    const newHistory = {
      type: ActionTypes.Delete,
      changes: [ls.captions[ls.selected_caption_i],]
    }

    this.setState({
      selected_caption_i: null,
      ...this.deleteCaptionObject(ls.selected_caption_i),

    }, () => this.updateHistory(newHistory))
  }

  updateHistory(newAction: ActionHistory) {
    const hc = this.state.historyCursor
    let lastHistory = this.state.capsHistory

    // [0, 1, 2, 3], c:2 => [0, 1, 2]
    if (hc !== lastHistory.length - 1) // if it didn't point on the last history before updating history
      lastHistory = lastHistory.slice(0, hc + 1)

    // [1, 2, 3, 4] => [2, 3, 4]
    else if (lastHistory.length >= MAX_HISTORY)
      lastHistory = lastHistory.slice(1)

    this.setState({
      capsHistory: [...lastHistory, newAction],
      historyCursor: lastHistory.length
    })
  }

  undoRedo(undo: boolean) {
    const
      hc = this.state.historyCursor,
      redo = !undo,
      history = this.state.capsHistory

    let newState: object

    // out of range check
    if (!((undo && (hc >= 0)) || (redo && (hc + 1 < history.length)))) return

    let
      caps = this.state.captions,
      lastAction = history[hc + (undo ? 0 : +1)]

    if (
      (undo && lastAction.type === ActionTypes.Create) ||
      (redo && lastAction.type === ActionTypes.Delete)
    ) {
      newState =
        this.deleteCaptionObject(caps.findIndex(c => c.hash === lastAction.changes[0].hash))
    }

    else if (
      (undo && lastAction.type === ActionTypes.Delete) ||
      (redo && lastAction.type === ActionTypes.Create)
    ) {
      newState = this.addCaptionObject(lastAction.changes[0])
    }

    else {
      if (undo)
        newState = this.changeCaptionObject(lastAction.changes[1], lastAction.changes[0])
      else // redo
        newState = this.changeCaptionObject(lastAction.changes[0], lastAction.changes[1])
    }

    this.setState({
      ...newState,
      selected_caption_i: null,
      historyCursor: hc + (undo ? -1 : +1),
    })
  }

  // -- caption selection

  captionSelectionToggle(index: number) {
    this.setState({
      selected_caption_i:
        this.state.selected_caption_i === index ? null : index
    })
  }

  goToNextEnd() {
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
    fileDownload(export2srt(this.state.captions), 'subtitle.srt');
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
            onDurationChanges={du => this.setState({ totalTime: du })}
          />
        </div>

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
            iconClassName="fas fa-redo" // [0, 1, 2, 3]
            text={"redo " + ((this.state.capsHistory.length - 1) - this.state.historyCursor)}
            disabled={this.state.historyCursor >= this.state.capsHistory.length - 1}
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
          className="my-1"
          duration={this.state.totalTime}
          currentTime={this.state.currentTime}
          onSelectNewTime={nt => this.VideoPlayerRef.current?.setTime(nt)}

          captions={caps}
          onCaptionSelected={this.captionSelectionToggle}
          selectedCaption_i={selected_ci}
        />

        <CaptionEditor
          currentTime={this.state.currentTime}
          totalTime={this.state.totalTime}
          caption={selected_ci === null ? null : caps[selected_ci]}
          onCaptionChanged={this.changeCaptionUIHandler}
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