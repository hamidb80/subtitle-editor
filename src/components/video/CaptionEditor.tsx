import React, { FocusEvent, ChangeEvent } from 'react'
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
  constructor(props: any) {
    super(props)

    this.state = {
      caption_i: null,
      content2change: ''
    }

    this.onCaptionContentChanged = this.onCaptionContentChanged.bind(this)
    this.onCaptionTimeRangeChange = this.onCaptionTimeRangeChange.bind(this)
    this.handleCaptionChange = this.handleCaptionChange.bind(this)
  }

  componentDidUpdate() {
    if (this.props.selectedCaption_i !== this.state.caption_i) {
      this.setState({
        caption_i: this.props.selectedCaption_i,
        content2change: this.props.selectedCaption_i !== null ? this.props.captions[this.props.selectedCaption_i].content : ''
      })
    }
  }

  onCaptionContentChanged(e: ChangeEvent<HTMLInputElement>) {
    this.setState({ content2change: e.target.value })
  }

  onCaptionTimeRangeChange(startChange: number | null = 0, endChange: number | null = 0) {
    if (this.props.selectedCaption_i !== null) {
      const cap = this.props.captions[this.props.selectedCaption_i]

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

      this.props.onCaptionChanged(this.props.selectedCaption_i, cap)
    }
  }

  handleCaptionChange(e: FocusEvent<HTMLInputElement>) {
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
    if (this.state.caption_i !== null) {
      let cap: Caption | null = null // myabe it's not available [for eg it can be removed]

      try { cap = this.props.captions[this.state.caption_i] }
      catch (err) { }
      if (!cap) return ''

      return (
        <div className="caption-editor-wrapper">
          <TimeControll
            time={cap.start}
            onChange={changeValue => { this.onCaptionTimeRangeChange(changeValue, 0) }}
          />

          <div>
            <input type="text" className="form-control d-inline-block caption-editor" value={this.state.content2change}
              onChange={this.onCaptionContentChanged}
              autoFocus onBlur={this.handleCaptionChange} />
          </div>

          <TimeControll
            time={cap.end}
            onChange={changeValue => { this.onCaptionTimeRangeChange(0, changeValue) }}
          />
        </div>
      )
    }

    else return (
      <div className="caption-editor-wrapper">
        <TimeControll time={0} />

        <div className="caption-content">
          <span> </span>
        </div>

        <TimeControll time={0} />
      </div>
    )
  }
}

export default CaptionEditor
