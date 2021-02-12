import React, { ChangeEvent } from 'react'
import hotkeys from 'hotkeys-js'

import { TimeControll } from "."
import { Caption } from "../../utils/caption"

import '../../styles/components/caption-editor.sass'


type Props = {
  currentTime: number

  captions: Caption[]
  selectedCaption_i: number | null
  onCaptionChanged: (index: number, c: Caption) => void
}
type State = {
  caption_i: number | null
  content2change: string
}

class CaptionEditor extends React.Component<Props, State> {
  inputRef: React.RefObject<HTMLInputElement>

  constructor(props: any) {
    super(props)

    this.state = {
      caption_i: null,
      content2change: ''
    }

    this.inputRef = React.createRef()

    this.onCaptionContentChanged = this.onCaptionContentChanged.bind(this)
    this.onCaptionTimeRangeChange = this.onCaptionTimeRangeChange.bind(this)
    this.handleCaptionChange = this.handleCaptionChange.bind(this)
  }
  componentDidMount(){
    hotkeys('alt+left', kv => {
      this.onCaptionTimeRangeChange(-0.5, 0)
    })
    hotkeys('alt+right', kv => {
      this.onCaptionTimeRangeChange(+0.5, 0)
    })

    hotkeys('tab+left', kv => {
      kv.preventDefault()
      this.onCaptionTimeRangeChange(0, -0.5)
    })
    hotkeys('tab+right', kv => {
      kv.preventDefault()
      this.onCaptionTimeRangeChange(0, +0.5)
    })
  }

  componentDidUpdate() {
    if (this.props.selectedCaption_i !== this.state.caption_i) {
      this.handleCaptionChange() // onblur is not triggered when you blur it by code, so this line solves the problem

      this.setState({
        caption_i: this.props.selectedCaption_i,
        content2change: this.props.selectedCaption_i !== null ?
          this.props.captions[this.props.selectedCaption_i].content : ''
      })
    }
  }

  onCaptionContentChanged(e: ChangeEvent<HTMLInputElement>) {
    this.setState({ content2change: e.target.value })
  }

  onCaptionTimeRangeChange(startChange: number | null = 0, endChange: number | null = 0) {
    if (this.state.caption_i !== null) {
      const cap = this.props.captions[this.state.caption_i]

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

      this.props.onCaptionChanged(this.state.caption_i, cap)
    }
  }

  handleCaptionChange() {
    if (this.state.caption_i !== null) {
      const cap = this.props.captions[this.state.caption_i]

      // only trigger the event when content changed
      if (cap.content !== this.state.content2change) {
        cap.content = this.state.content2change
        this.props.onCaptionChanged(this.state.caption_i, cap)
      }
    }
  }

  render() {
    let cap: Caption | null = null // myabe it's not available [for eg it can be removed]

    if (this.state.caption_i !== null)
      try { cap = this.props.captions[this.state.caption_i] }
      catch (err) { }

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
