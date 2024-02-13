import React, { MouseEvent } from 'react'
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable'
import hotkeys from 'hotkeys-js'

import { CircleBtn } from "../form"
import { Caption } from "../../utils/caption"
import { second2timestamp } from "../../utils/timestamp"
import Konva from "konva"

import {
  MAX_SCALE, DEFAULT_SCALE, SHOOT_ZOOM, TIMELINE_CURSOR_OFFSET, MAX_CANVAS_SIZE
} from "../../utils/consts"

import "./subtitle-timeline.sass"

const out = -10

export default class SubtitleTimeline extends React.Component<{
  className?: string

  duration: number
  currentTime: number
  onSelectNewTime: (newTime: number) => void

  captions: Caption[]
  selectedCaption_i: number | null
  onCaptionSelected: (captionIndex: number | null) => void
  onCaptionChanged: (captionIndex: number, captionItem: Caption) => void

  scale: number
  onScaleChanged: (scale: number) => void
},
  {
    error: boolean
    lastScale: number
    timeRulers: string[]
    cursorXPos: number
  }
> {
  canvasRef: React.RefObject<HTMLDivElement>
  group: Konva.Group | null

  constructor(props: any) {
    super(props)

    this.state = {
      error: false,
      lastScale: 0,
      cursorXPos: out,
      timeRulers: [], // array of dataUrl
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

    this.calculateRealOffset = this.calculateRealOffset.bind(this)
  }

  // --------------------------- methods ---------------------
  captionSelectionHandler(index: number) {
    this.props.onCaptionSelected(index)
  }

  zoom(value: number) {
    const new_val = this.props.scale + value

    if (this.isZoomInValid(new_val) && this.isZoomOutValid(new_val))
      this.props.onScaleChanged(new_val)
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

  calculateRealOffset(e: MouseEvent) {
    const mouseX = e.pageX, // based on the screen
      PostionOfElem = e.currentTarget.getBoundingClientRect()

    return mouseX - PostionOfElem.left
  }

  setTimeFromPixels(timePerPixels: number) {
    this.props.onSelectNewTime(this.props.currentTime - TIMELINE_CURSOR_OFFSET + timePerPixels / this.props.scale)
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
      s = this.props.scale,
      maximumSecondsPerChunk = Math.floor(MAX_CANVAS_SIZE / s),
      d = this.props.duration,
      progress = 0

    while (progress < d) {
      let limit = Math.min(d, progress + maximumSecondsPerChunk)

      for (let second = progress; second <= limit; second++) {
        const
          time = second2timestamp(second, "minute"),
          common = { text: time, x: this.props.scale * second - 14, y: 4, fontSize: 13, fontFamily: "tahoma" }

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

    if (this.props.scale === 0) {
      let currentScale = DEFAULT_SCALE

      if (currentScale <= 0)
        this.setState({ error: true })
    }

    // to prevent useless rerender
    else if (this.state.lastScale !== this.props.scale) {
      this.setState({ lastScale: this.props.scale }, this.updateRuler)
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
      scale = this.props.scale

    return (
      <div className={"advanced-timeline " + this.props.className}>

        <div className="side-bar">
          <CircleBtn
            className="mb-1"
            onClick={this.zoomIn}
            disabled={!this.isZoomInValid(this.props.scale + SHOOT_ZOOM)}
            iconClassName="fas fa-search-plus"
          />

          <div className="center scale-text">
            {scale}
          </div>

          <CircleBtn
            className="mb-1"
            onClick={this.zoomOut}
            disabled={!this.isZoomOutValid(this.props.scale - SHOOT_ZOOM)}
            iconClassName="fas fa-search-minus"
          />
        </div>

        <div className="advanced-timeline-wrapper">

          <div className="current-time-cursor" style={{
            marginLeft: `${TIMELINE_CURSOR_OFFSET * scale}px`,
          }}></div>

          <div className="mover"
            onMouseMove={e => this.setState({ cursorXPos: this.calculateRealOffset(e) })}
            onMouseLeave={() => this.setState({ cursorXPos: out })}
          >

            <div className="konva-instance" ref={this.canvasRef}></div>

            <div className="time-cursor-wrapper">
              <UserCursorElem
                posx={this.state.cursorXPos}
                onclick={(e: MouseEvent) => this.setTimeFromPixels(this.calculateRealOffset(e))} />
            </div>

            <div className="inside-timeline" style={{
              transform: `translateX(${progress}%)`,
              width: `${duration * scale}px`,
              transition: "0.1s linear"
            }}>
              <div id="sound-wave"></div>

              <div className="times" >
                {this.state.timeRulers.map((dataUrl, i) =>
                  <img src={dataUrl} key={`time-ruler-${i}`} />
                )}
              </div>

              <div className="captions-side">
                {this.props.captions.map((c: Caption, i) =>
                  <CaptionItem
                    cap={c}
                    index={i}
                    selected_i={this.props.selectedCaption_i ?? -1}
                    clickFunc={this.captionSelectionHandler}
                    onCaptionChanged={this.props.onCaptionChanged}
                    scale={scale}
                  />
                )
                }
              </div>
            </div>

          </div>
        </div>

      </div>
    )
  }
}

class CaptionItem extends React.Component<{
  cap: Caption
  index: number
  selected_i: number
  clickFunc: (index: number) => void
  onCaptionChanged: (captionIndex: number, captionItem: Caption) => void
  scale: number
}, {
  cachedCap: Caption
}>{
  constructor(props: any) {
    super(props)

    this.state = {
      cachedCap: props.cap
    }

    this.onClick = this.onClick.bind(this)
    this.onDragCenterStop = this.onDragCenterStop.bind(this)
    this.onDragHeadStop = this.onDragHeadStop.bind(this)
    this.onDragTailStop = this.onDragTailStop.bind(this)
  }

  onDragCenterStop(_: DraggableEvent, dd: DraggableData) {
    if (this.props.selected_i !== this.props.index) return

    let
      c = this.props.cap,
      s = this.props.scale,
      u = {
        ...c,
        start: c.start + dd.lastX / s,
        end: c.end + dd.lastX / s,
      }

    this.props.onCaptionChanged(this.props.selected_i, u)
  }

  onDragHeadStop(_: DraggableEvent, dd: DraggableData) {
    if (this.props.selected_i !== this.props.index) return

    let
      c = this.props.cap,
      s = this.props.scale,
      u = {
        ...c,
        start: c.start + dd.lastX / s,
      }

    this.props.onCaptionChanged(this.props.selected_i, u)
  }

  onDragTailStop(_: DraggableEvent, dd: DraggableData) {
    if (this.props.selected_i !== this.props.index) return

    let
      c = this.props.cap,
      s = this.props.scale,
      u = {
        ...c,
        end: c.end + dd.lastX / s,
      }

    this.props.onCaptionChanged(this.props.selected_i, u)
  }

  onClick(_: MouseEvent) {
    this.props.clickFunc(this.props.index)
  }

  render() {
    let
      c = this.props.cap,
      width = c.end - c.start,
      isSelected = this.props.selected_i === this.props.index

    return (
      <div className={"caption-item " + (isSelected ? 'selected' : '')}
        key={c.hash} onClick={this.onClick}
        style={{
          left: `${c.start * this.props.scale}px`,
          width: `${width * this.props.scale}px`
        }}>

        <div className="start-pad">
          <Draggable
            axis={isSelected ? "x" : "none"}
            position={{ x: 0, y: 0 }}
            onStop={this.onDragHeadStop}
          >
            <div className="inside"></div>
          </Draggable>
        </div>

        <div className="content">

          <Draggable
            axis={isSelected ? "x" : "none"}
            position={{ x: 0, y: 0 }}
            onStop={this.onDragCenterStop}
          >
            <div className="slide"></div>
          </Draggable>
          <span>{c.content}</span>
        </div>

        <div className="end-pad">
          <Draggable
            axis={isSelected ? "x" : "none"}
            position={{ x: 0, y: 0 }}
            onStop={this.onDragTailStop}
          >
            <div className="inside"></div>
          </Draggable>
        </div>

      </div >
    )
  }
}

class UserCursorElem extends React.Component<{
  onclick: (e: MouseEvent) => void
  posx: number
}>
{
  render() {
    return (
      <div className="user-time-cursor-wrapper"
        onClick={this.props.onclick} >
        <div className="user-time-cursor"
          style={{ transform: `translateX(${this.props.posx}px)` }}></div>
      </div>
    )
  }
}