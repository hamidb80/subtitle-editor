import React, { ChangeEvent } from 'react'
import hotkeys from 'hotkeys-js'

import { TimeControll } from "."
import { Caption } from "../../utils/caption"

import { SHOOT_TIME_MINOR } from "../../utils/consts"

import './caption-editor.sass'


type Props = {
  currentTime: number // for stick time button
  caption: Caption | null
  onCaptionChanged: (c: Caption) => void
}
type State = {
  my_caption: Caption | null,
  content2change: string
}

class CaptionEditor extends React.Component<Props, State> {
  inputRef: React.RefObject<HTMLInputElement>

  constructor(props: any) {
    super(props)

    this.state = {
      my_caption: null,
      content2change: ""
    }

    this.inputRef = React.createRef()

    this.onCaptionContentChanged = this.onCaptionContentChanged.bind(this)
    this.onCaptionTimeRangeChange = this.onCaptionTimeRangeChange.bind(this)
    this.handleCaptionChange = this.handleCaptionChange.bind(this)
  }
  componentDidMount() {
    hotkeys('alt+left', () => {
      this.onCaptionTimeRangeChange(-SHOOT_TIME_MINOR, 0)
    })
    hotkeys('alt+right', () => {
      this.onCaptionTimeRangeChange(+SHOOT_TIME_MINOR, 0)
    })

    hotkeys('tab+left', kv => {
      kv.preventDefault()
      this.onCaptionTimeRangeChange(0, -SHOOT_TIME_MINOR)
    })
    hotkeys('tab+right', kv => {
      kv.preventDefault()
      this.onCaptionTimeRangeChange(0, +SHOOT_TIME_MINOR)
    })
  }

  componentDidUpdate() {
    if (this.props.caption === null && this.state.my_caption !== null ||
      this.props.caption !== null && (this.props.caption.hash !== this.state.my_caption?.hash)) {

      this.handleCaptionChange() // onblur is not triggered when you blur it by code, so this line solves the problem

      this.setState({
        my_caption: this.props.caption === null ? null : { ...this.props.caption },
        content2change: this.props.caption !== null ? this.props.caption.content : ""
      })
    }
  }

  onCaptionContentChanged(e: ChangeEvent<HTMLInputElement>) {
    this.setState({ content2change: e.target.value })
  }
  // null value for stick time button
  onCaptionTimeRangeChange(startChange: number | null = 0, endChange: number | null = 0) {
    if (this.state.my_caption !== null) {
      const cap = this.state.my_caption

      // controll the caption start/end time 
      if (startChange === null)
        cap.start = this.props.currentTime
      else
        cap.start += startChange

      if (endChange === null)
        cap.end = this.props.currentTime
      else
        cap.end += endChange

      // sync end & start
      if (cap.start > cap.end) {
        if (endChange === 0)
          cap.end = cap.start
        else
          cap.start = cap.end
      }
      
      this.props.onCaptionChanged(cap)
    }
  }

  handleCaptionChange() {
    // only trigger the event when content changed
    if (this.state.my_caption) {
      const cap = this.state.my_caption
      cap.content = this.state.content2change

      this.props.onCaptionChanged(cap)
    }
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
            onChange={changeValue => { this.onCaptionTimeRangeChange(changeValue, 0) }}
          /> :
          <TimeControll time={0} />
        }

        <div>
          <input type="text" ref={this.inputRef}
            className={"form-control caption-editor " + (cap ? '' : 'invisible')}
            value={this.state.content2change}
            onChange={this.onCaptionContentChanged}
            onBlur={this.handleCaptionChange} />
        </div>

        {cap ?
          <TimeControll
            time={cap.end}
            onChange={changeValue => { this.onCaptionTimeRangeChange(0, changeValue) }}
          /> :
          <TimeControll time={0} />
        }
      </div>
    )
  }
}

export default CaptionEditor
