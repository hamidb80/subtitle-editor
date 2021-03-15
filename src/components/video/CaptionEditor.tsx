import React, { ChangeEvent } from 'react'
import hotkeys from 'hotkeys-js'

import { TimeControll } from "."
import { Caption, areSameCaptions } from "../../utils/caption"
import { v4 as uuid } from "uuid"

import { SHOOT_SUBTITLE_TIME_MAJOR } from "../../utils/consts"

import './caption-editor.sass'


type Props = {
  currentTime: number // for stick time button
  totalTime: number // video duration

  caption: Caption | null
  onCaptionChanged: (cOld: Caption, cNew: Caption) => void
}
type State = {
  lastCaption: Caption | null, // a copy of props.caption to edit
  newCaption: Caption | null
}
export default class CaptionEditor extends React.Component<Props, State> {
  inputRef: React.RefObject<HTMLInputElement>

  constructor(props: any) {
    super(props)

    this.state = {
      lastCaption: null,
      newCaption: null
    }
    this.inputRef = React.createRef()

    // --- binding methods ---
    this.onCaptionContentChanged = this.onCaptionContentChanged.bind(this)
    this.onCaptionTimeRangeChanged = this.onCaptionTimeRangeChanged.bind(this)
    this.handleCaptionChange = this.handleCaptionChange.bind(this)
    this.isCapInTimeRange = this.isCapInTimeRange.bind(this)
  }

  // ------------------- component API -------------------------

  componentDidMount() {
    hotkeys('alt+left', () => {
      this.onCaptionTimeRangeChanged(-SHOOT_SUBTITLE_TIME_MAJOR, 0)
    })

    hotkeys('home', kv => {
      kv.preventDefault()
      this.onCaptionTimeRangeChanged(null, 0)
    })
    hotkeys('end', kv => {
      kv.preventDefault()
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
    if ((this.props.caption === null && this.state.lastCaption !== null) ||
      (this.props.caption !== null && (
        this.props.caption.hash !== this.state.lastCaption?.hash))) {

      this.handleCaptionChange() // onblur is not triggered when you blur it by code, so this line solves the problem

      const newPropCap = this.props.caption === null ? null : { ...this.props.caption }
      this.setState({
        lastCaption: newPropCap ? { ...newPropCap } : null,
        newCaption: newPropCap ? { ...newPropCap } : null,
      })
    }
  }

  // ------------------- functionalities -------------------------

  isCapInTimeRange(time: number): boolean {
    return time >= 0 && time <= this.props.totalTime
  }

  onCaptionContentChanged(e: ChangeEvent<HTMLInputElement>) {
    const newCap = this.state.newCaption
    if (newCap !== null)
      this.setState({
        newCaption: { ...newCap, content: e.target.value }
      })
  }
  onCaptionTimeRangeChanged(startChange: number | null = 0, endChange: number | null = 0) { // null is the value for stick time button
    const cap = this.state.newCaption
    if (cap === null) return

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

    this.setState(
      { newCaption: cap },
      this.handleCaptionChange)

  }

  handleCaptionChange() {
    if (this.state.lastCaption === null || this.state.newCaption === null) return

    if (!areSameCaptions(this.state.lastCaption, this.state.newCaption)) {
      const
        lastCaption = this.state.lastCaption,
        newCap = { ...this.state.newCaption, hash: uuid() }

      console.log(`changed from ${lastCaption.content} to ${newCap.content}`);

      this.setState({
        lastCaption: { ...newCap },
        newCaption: { ...newCap }
      }, () => this.props.onCaptionChanged(lastCaption, newCap))
    }
  }

  render() {
    const cap = this.props.caption // myabe it's not available [for eg it can be removed]
    if (cap)
      this.inputRef.current?.focus()
    else
      this.inputRef.current?.blur()

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
          <input type="text" ref={this.inputRef} disabled={cap === null}
            className={"form-control caption-editor " + (cap ? '' : 'invisible') +
              // TODO make it customzible
              ((/^\w+/).test(this.state.newCaption?.content || "") ? "ltr" : "rtl")
            }
            value={this.state.newCaption?.content || ""}
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