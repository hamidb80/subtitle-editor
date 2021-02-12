import React, { MouseEvent, useState, ReactElement } from 'react'
import { CircleBtn } from "../form"
import { Caption } from "../../utils/caption"
import { second2timestamp } from "../../utils/timestamp"

import "../../styles/components/subtitle-timeline.sass"

const timelineCursorOffset = 4 // per seconds

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
  lastScale: number
  scale: number
}

class SubtitleTimeline extends React.Component<Props, State> {
  canvasRef: React.RefObject<HTMLCanvasElement>

  constructor(props: any) {
    super(props)

    this.state = {
      lastScale: 0,
      scale: 30,
    }
    this.canvasRef = React.createRef()

    // --- method binding ---
    this.captionSelectionHandler = this.captionSelectionHandler.bind(this)
    this.zoom = this.zoom.bind(this)
    this.drawTimeRuler = this.drawTimeRuler.bind(this)
    this.setTimeFromPixels = this.setTimeFromPixels.bind(this)
  }

  // --------------------------- methods ---------------------
  captionSelectionHandler(index: number) {
    this.props.onCaptionSelected(index)
  }

  zoom(value: number) {
    if (this.state.scale + value <= 0)
      return

    this.setState(prevState => ({
      scale: prevState.scale + value
    }))
  }

  setTimeFromPixels(timePerPixels: number) {
    this.props.onSelectNewTime(timePerPixels / this.state.scale)
  }
  //  ------------------- component API ----------------------

  componentDidUpdate() {
    // to prevent useless rerender
    if (this.state.lastScale !== this.state.scale) {
      this.setState({ lastScale: this.state.scale })
      this.drawTimeRuler()
    }
  }

  drawTimeRuler() {
    const ctx = this.canvasRef.current?.getContext('2d')
    if (ctx)
      for (let second = 0; second < this.props.duration; second++) {
        const time = second2timestamp(second, "minute")

        if (this.state.scale < 20) {
          if (second % 5 === 0)
            ctx.fillText(time, this.state.scale * second - 12, 20)
        }
        else if (this.state.scale < 30) {
          if (second % 3 === 0)
            ctx.fillText(time, this.state.scale * second - 12, 20)
        }
        else if (this.state.scale < 40) {
          ctx.fillText(time, this.state.scale * second - 12, second % 2 === 1 ? 12 : 20)
        }
        else {
          ctx.fillText(time, this.state.scale * second - 12, 20)
        }

        ctx.fillRect(this.state.scale * second, 24, 2, 10)
      }
  }

  render() {
    const
      scale = this.state.scale,
      duration = this.props.duration,
      percent = -(this.props.currentTime - timelineCursorOffset) / duration * 100

    return (
      <div className={"advanced-timeline " + this.props.className}>

        <div className="side-bar">
          <CircleBtn
            className="mb-1"
            onClick={() => this.zoom(+10)}
            iconClassName="fas fa-search-plus"
          />
          <CircleBtn
            className="mb-1"
            onClick={() => this.zoom(-10)}
            iconClassName="fas fa-search-minus"
          />

          <div className="center">
            {scale}
          </div>
        </div>

        <div className="advanced-timeline-wrapper">

          <div className="current-time-cursor" style={{
            marginLeft: `${timelineCursorOffset * scale}px`,
          }}></div>

          <div className="mover" style={{
            transform: `translateX(${percent}%)`,
            width: `${duration * scale}px`,
          }}>

            <div className="time-ruler-wrapper">
              <canvas className="time-ruler" ref={this.canvasRef}
                width={duration * scale} height="32"></canvas>

              <UserCursorElem onTimePick={this.setTimeFromPixels} />
            </div>

            <div className="captions-side">
              {this.props.captions.map((c: Caption, i) =>
                captionItem(c, i, this.props.selectedCaption_i, this.captionSelectionHandler, scale))
              }
            </div>

          </div>
        </div>

      </div>
    )
  }
}

// captions
function captionItem(c: Caption, index: number, selected_i: null | number, clickFunc: (index: number) => void, scale: number): JSX.Element {
  const width = c.end - c.start

  return (
    <div className={"caption-item " + (selected_i === index ? 'selected' : '')}
      key={index} onClick={e => clickFunc(index)}
      style={{
        left: `${c.start * scale}px`,
        width: `${width * scale}px`
      }}>
      <span>
        {c.content}
      </span>
    </div>
  )
}

type USPROPS = {
  onTimePick: (userCursorX: number) => void
}
const UserCursorElem: React.FC<USPROPS> = (props: USPROPS): ReactElement => {
  let [cursorXPos, setCursor] = useState(0)

  const
    calculateRealOffset = (e: MouseEvent) => {
      const mouseX = e.pageX, // based on the screen
        PostionOfElem = e.currentTarget.getBoundingClientRect()

      return mouseX - PostionOfElem.left
    },
    mouseMove = (e: MouseEvent) => setCursor(calculateRealOffset(e)),
    onClick = (e: MouseEvent) => props.onTimePick(calculateRealOffset(e))


  return (
    <div className="user-time-cursor-wrapper"
      onMouseMove={mouseMove} onMouseLeave={() => setCursor(0)}
      onClick={onClick}>

      <div className="user-time-cursor"
        style={{ transform: `translateX(${cursorXPos}px)` }}
      ></div>
    </div>
  )
}

export default SubtitleTimeline