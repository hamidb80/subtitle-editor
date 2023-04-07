import React, { MouseEvent } from 'react'
import hotkeys from 'hotkeys-js'

import { CircleBtn } from "../form"
import { Caption } from "../../utils/caption"
import { second2timestamp } from "../../utils/timestamp"
import Konva from "konva"

import {
  MAX_SCALE, DEFAULT_SCALE, SHOOT_ZOOM, TIMELINE_CURSOR_OFFSET, MAX_CANVAS_SIZE
} from "../../utils/consts"

import "./subtitle-timeline.sass"

type Props = {
  className?: string

  duration: number
  currentTime: number
  onSelectNewTime: (newTime: number) => void

  captions: Caption[]
  selectedCaption_i: number | null
  onCaptionSelected: (captionIndex: number) => void
}

type State = {
  error: boolean
  lastScale: number
  scale: number
  timeRulers: string[]
}

export default class SubtitleTimeline extends React.Component<Props, State> {
  canvasRef: React.RefObject<HTMLDivElement>
  group: Konva.Group | null

  constructor(props: any) {
    super(props)

    this.state = {
      error: false,
      lastScale: 0,
      scale: 0,
      timeRulers: [] // array of dataUrl
    }

    this.canvasRef = React.createRef()
    this.group = null


    // --- method binding ---
    this.captionSelectionHandler = this.captionSelectionHandler.bind(this)
    this.initTimeRuler = this.initTimeRuler.bind(this)
    this.updateRuler = this.updateRuler.bind(this)
    this.setTimeFromPixels = this.setTimeFromPixels.bind(this)

    this.zoom = this.zoom.bind(this)
    this.zoomIn = this.zoomIn.bind(this)
    this.zoomOut = this.zoomOut.bind(this)
    this.isZoomInValid = this.isZoomInValid.bind(this)
    this.isZoomOutValid = this.isZoomOutValid.bind(this)
  }

  // --------------------------- methods ---------------------
  captionSelectionHandler(index: number) {
    this.props.onCaptionSelected(index)
  }

  zoom(value: number) {
    const new_val = this.state.scale + value

    if (this.isZoomInValid(new_val) && this.isZoomOutValid(new_val))
      this.setState({ scale: new_val })
  }
  isZoomInValid(val: number): boolean {
    return (val <= MAX_SCALE)
  }
  isZoomOutValid(val: number) {
    return val > 0
  }
  zoomIn() {
    this.zoom(+SHOOT_ZOOM)
  }
  zoomOut() {
    this.zoom(-SHOOT_ZOOM)
  }

  setTimeFromPixels(timePerPixels: number) {
    this.props.onSelectNewTime(this.props.currentTime - TIMELINE_CURSOR_OFFSET + timePerPixels / this.state.scale)
  }

  initTimeRuler() {
    let
      stage = new Konva.Stage({
        container: this.canvasRef.current as HTMLDivElement,
        width: window.innerWidth,
        height: 32,
      }),
      layer = new Konva.Layer()

    this.group = new Konva.Group()
    layer.add(this.group)
    stage.add(layer)

    this.updateRuler()
  }

  updateRuler() {
    let
      cachedTimeRulers: string[] = [],
      s = this.state.scale,
      maximumSecondsPerChunk = Math.floor(MAX_CANVAS_SIZE / s),
      d = this.props.duration,
      progress = 0

    while (progress < d) {
      let limit = Math.min(d, progress + maximumSecondsPerChunk)

      for (let second = progress; second <= limit; second++) {
        const
          time = second2timestamp(second, "minute"),
          common = { text: time, x: this.state.scale * second - 14, y: 4, fontSize: 13, fontFamily: "tahoma" }

        if (s < 20) {
          if (second % 5 === 0)
            this.group?.add(new Konva.Text(common))
        }
        else if (s < 30) {
          if (second % 3 === 0)
            this.group?.add(new Konva.Text(common))
        }
        else if (s < 40) {
          if (second % 2 === 0)
            this.group?.add(new Konva.Text(common))
        }
        else {
          this.group?.add(new Konva.Text(common))
        }

        this.group?.add(new Konva.Rect({ x: s * second, y: 22, width: 2, height: 10, fill: "black" }))
      }

      cachedTimeRulers.push(this.group?.toDataURL() as string)
      this.group?.destroyChildren()
      progress = limit
    }

    this.setState({ timeRulers: cachedTimeRulers })
  }

  //  ------------------- component API ----------------------
  componentDidMount() {
    // --- register shortcuts
    hotkeys('ctrl+=', kv => {
      kv.preventDefault()
      this.zoomIn()
    })
    hotkeys('ctrl+-', kv => {
      kv.preventDefault()
      this.zoomOut()
    })
  }

  componentDidUpdate() {
    if (this.props.duration === 0) return

    if (this.state.scale === 0) {
      let currentScale = DEFAULT_SCALE

      if (currentScale <= 0)
        this.setState({ error: true, scale: -1 })
      else
        this.setState({ scale: currentScale })
    }

    // to prevent useless rerender
    else if (this.state.lastScale !== this.state.scale) {
      this.setState({ lastScale: this.state.scale }, this.updateRuler)
    }

    if (this.group === null)
      this.initTimeRuler()
  }

  render() {
    if (this.state.error)
      return <div className="center badge-danger"> an error acuured </div>

    const
      duration = this.props.duration,
      progress = -(this.props.currentTime - TIMELINE_CURSOR_OFFSET) / duration * 100,
      scale = this.state.scale

    return (
      <div className={"advanced-timeline " + this.props.className}>

        <div className="side-bar">
          <CircleBtn
            className="mb-1"
            onClick={this.zoomIn}
            disabled={!this.isZoomInValid(this.state.scale + SHOOT_ZOOM)}
            iconClassName="fas fa-search-plus"
          />

          <div className="center scale-text">
            {scale}
          </div>

          <CircleBtn
            className="mb-1"
            onClick={this.zoomOut}
            disabled={!this.isZoomOutValid(this.state.scale - SHOOT_ZOOM)}
            iconClassName="fas fa-search-minus"
          />
        </div>

        <div className="advanced-timeline-wrapper">

          <div className="current-time-cursor" style={{
            marginLeft: `${TIMELINE_CURSOR_OFFSET * scale}px`,
          }}></div>

          <div className="mover">

            <div className="time-ruler-konva" ref={this.canvasRef}></div>

            <div className="time-ruler-wrapper">
              <UserCursorElem onTimePick={this.setTimeFromPixels} />
            </div>

            <div style={{
              transform: `translateX(${progress}%) translateY(-30px)`,
              width: `${duration * scale}px`,
              transition: "0.1s linear"
            }}>

              <div className="times" >
                {this.state.timeRulers.map(dataUrl =>
                  <img src={dataUrl} />
                )}
              </div>

              <div className="captions-side">
                {this.props.captions.map((c: Caption, i) =>
                  captionItem(c, i, this.props.selectedCaption_i, this.captionSelectionHandler, scale))
                }
              </div>
            </div>

          </div>
        </div>

      </div>
    )
  }
}

// captions
function captionItem(
  c: Caption, index: number, selected_i: null | number,
  clickFunc: (index: number) => void, scale: number
): JSX.Element {
  const width = c.end - c.start

  return (
    <div className={"caption-item " + (selected_i === index ? 'selected' : '')}
      key={c.hash} onClick={e => clickFunc(index)}
      style={{
        left: `${c.start * scale}px`,
        width: `${width * scale}px`
      }}>

      <span>{c.content}</span>
    </div>
  )
}

type USPROPS = {
  onTimePick: (userCursorX: number) => void
}
class UserCursorElem extends React.Component<USPROPS> {
  state = { cursorXPos: 0 }

  calculateRealOffset(e: MouseEvent) {
    const mouseX = e.pageX, // based on the screen
      PostionOfElem = e.currentTarget.getBoundingClientRect()

    return mouseX - PostionOfElem.left
  }

  render() {
    return (
      <div className="user-time-cursor-wrapper"
        onMouseMove={e => this.setState({ cursorXPos: this.calculateRealOffset(e) })}
        onMouseLeave={() => this.setState({ cursorXPos: 0 })}
        onClick={e => this.props.onTimePick(this.calculateRealOffset(e))} >

        <div className="user-time-cursor"
          style={{ transform: `translateX(${this.state.cursorXPos}px)` }}></div>
      </div >
    )
  }
}