import React, { ChangeEvent } from 'react'
import hotkeys from 'hotkeys-js'

import { TimeControll } from "."
import { Caption } from "../../utils/caption"

import { SHOOT_SUBTITLE_TIME_MAJOR } from "../../utils/consts"

import './caption-editor.sass'


type Props = {
  currentTime: number // for stick time button
  totalTime: number // video duration

  caption: Caption | null
  onCaptionChanged: (c: Caption) => void
}
type State = {
  my_caption: Caption | null, // a copy of props.caption to edit
  content2change: string // 
}
export default class CaptionEditor extends React.Component<Props, State> {
  inputRef: React.RefObject<HTMLInputElement>

  constructor(props: any) {
    super(props)

    this.state = {
      my_caption: null,
      content2change: ""
    }
    this.inputRef = React.createRef()

    // --- binding methods ---
    this.onCaptionContentChanged = this.onCaptionContentChanged.bind(this)
    this.onCaptionTimeRangeChanged = this.onCaptionTimeRangeChanged.bind(this)
    this.handleCaptionChange = this.handleCaptionChange.bind(this)
    this.isCapInTimeRange = this.isCapInTimeRange.bind(this)
  }

  componentDidMount() {
    hotkeys('alt+left', () => {
      this.onCaptionTimeRangeChanged(-SHOOT_SUBTITLE_TIME_MAJOR, 0)
    })

    hotkeys('home', kv => {
      this.onCaptionTimeRangeChanged(null, 0)
    })
    hotkeys('end', kv => {
      this.onCaptionTimeRangeChanged(0, null)
    })

    hotkeys('alt+right', () => {
      this.onCaptionTimeRangeChanged(+SHOOT_SUBTITLE_TIME_MAJOR, 0)
    })
    hotkeys('tab+left', kv => {
      kv.preventDefault()
      this.onCaptionTimeRangeChanged(0, -SHOOT_SUBTITLE_TIME_MAJOR)
    })
    hotkeys('tab+right', kv => {
      kv.preventDefault()
      this.onCaptionTimeRangeChanged(0, +SHOOT_SUBTITLE_TIME_MAJOR)
    })
  }

  componentDidUpdate() {
    if ((this.props.caption === null && this.state.my_caption !== null) ||
      (this.props.caption !== null && (this.props.caption.hash !== this.state.my_caption?.hash))) {

      this.handleCaptionChange() // onblur is not triggered when you blur it by code, so this line solves the problem

      this.setState({
        my_caption: this.props.caption === null ? null : { ...this.props.caption },
        content2change: this.props.caption !== null ? this.props.caption.content : ""
      })
    }
  }


  isCapInTimeRange(time: number): boolean {
    return time >= 0 && time <= this.props.totalTime
  }

  onCaptionContentChanged(e: ChangeEvent<HTMLInputElement>) {
    this.setState({ content2change: e.target.value })
  }
  onCaptionTimeRangeChanged(startChange: number | null = 0, endChange: number | null = 0) { // null value for stick time button
    if (this.state.my_caption === null) return
    const cap = this.state.my_caption

    // controll the caption start/end time 
    if (startChange === null)
      cap.start = this.props.currentTime
    else if (this.isCapInTimeRange(cap.start + startChange))
      cap.start += startChange

    if (endChange === null)
      cap.end = this.props.currentTime
    else if (this.isCapInTimeRange(cap.end + endChange))
      cap.end += endChange

    // sync end & start
    if (cap.start > cap.end) {
      if (endChange === 0)
        cap.end = cap.start
      else
        cap.start = cap.end
    }

    this.handleCaptionChange()
  }

  handleCaptionChange() {
    if (this.state.my_caption === null)
      return

    const new_cap = {
      ...this.state.my_caption,
      content: this.state.content2change
    }
    this.props.onCaptionChanged(new_cap)
  }

  render() {
    const cap = this.props.caption // myabe it's not available [for eg it can be removed]
    if (cap)
      this.inputRef.current?.focus()

    return (
      <div className="caption-editor-wrapper">
        {cap ?
          <TimeControll
            time={cap.start}
            onChange={changeValue => { this.onCaptionTimeRangeChanged(changeValue, 0) }}
          /> :
          <TimeControll time={0} />
        }

        <div>
          <input type="text" ref={this.inputRef}
            className={"form-control caption-editor " + (cap ? '' : 'invisible') +
            ((/^\w+/).test(this.state.content2change) ? "ltr" : "rtl")
           }
            value={this.state.content2change}
            onChange={this.onCaptionContentChanged}
            onBlur={this.handleCaptionChange} />
        </div>

        {cap ?
          <TimeControll
            time={cap.end}
            onChange={changeValue => { this.onCaptionTimeRangeChanged(0, changeValue) }}
          /> :
          <TimeControll time={0} />
        }
      </div>
    )
  }
}