import React, { MouseEvent } from 'react'
import { second2timestamp } from "../../utils/timestamp"

import './simple-timeline.sass'

type Props = {
  className?: string

  totalTime: number // per seconds
  currentTime: number
  onSelectNewTime?: (newTime: number) => void
}
export default class SimpleTimeline extends React.Component<Props> {
  constructor(props: any) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(e: MouseEvent<HTMLDivElement>) {
    const handler = this.props.onSelectNewTime

    if (handler) {
      const element = e.currentTarget
        , xUserClicked = e.pageX
        , xFirstOfProgressBar = element.offsetLeft
        , width = element.clientWidth
        , videoDuration = this.props.totalTime

      const newTime = ((xUserClicked - xFirstOfProgressBar) / width) * videoDuration

      handler(newTime)
    }
  }

  render() {
    if (this.props.totalTime === undefined)
      return ''

    const
      widthPercent = this.props.currentTime / this.props.totalTime * 100,
      time = second2timestamp(this.props.currentTime, "minute"),
      duration = second2timestamp(this.props.totalTime, "minute")

    return (
      <div className={"timeline " + this.props.className}
        onClick={this.handleClick}>
        
        <div className="progress">
          <div className="progress-bar" style={{ width: `${widthPercent}%` }}></div>
          <div className="cursor"></div>
        </div>

        <div className="time-text-wrapper">
          <div className="time-text">
            <span> {time} </span>
            <span> - </span>
            <span> {duration} </span>
          </div>
        </div>

      </div>
    )
  }
}