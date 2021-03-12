import React, { ChangeEvent, FocusEvent } from 'react'
import { second2timestamp, timestamp2seconds } from "../../utils/timestamp"

import { CircleBtn } from "../form"
import { SHOOT_SUBTITLE_TIME_MAJOR, SHOOT_SUBTITLE_TIME_MINOR } from "../../utils/consts";

import './time-controll.sass'

type Props = {
  time: number // per seconds
  onChange?: (changedValue: number | null) => void
}
type State = {
  isEditing: boolean
  timeEditing: string
}
export default class TimeControll extends React.Component<Props, State> {
  constructor(props: any) {
    super(props)

    this.state = {
      isEditing: false,
      timeEditing: ''
    }

    this.changeHandler = this.changeHandler.bind(this)
    this.changeTimeEditing = this.changeTimeEditing.bind(this)
    this.textEditorTimeChange = this.textEditorTimeChange.bind(this)
  }

  changeEditingState(val: boolean) {
    if (this.props.onChange)
      this.setState({
        isEditing: val,
        timeEditing: val ? second2timestamp(this.props.time, "complete") : ''
      })
  }

  textEditorTimeChange(e: FocusEvent<HTMLInputElement>) {
    const newTimeString = e.target.value
    let newTime: number


    try { newTime = timestamp2seconds(newTimeString) }
    catch (error) { return }

    const delataTime = newTime - this.props.time

    this.changeHandler(delataTime)
    this.changeEditingState(false)
  }

  changeTimeEditing(e: ChangeEvent<HTMLInputElement>) {
    this.setState({ timeEditing: e.target.value })
  }

  changeHandler(changedValue: number | null) {
    if (this.props.onChange)
      this.props.onChange(changedValue)
  }

  render() {
    const
      disabled = this.props.onChange === undefined,
      time = second2timestamp(this.props.time, "complete"),

      timeElem = this.state.isEditing ?
        (<div className="time-editor">
          <input type="text" className="time-text-editor"
            onChange={this.changeTimeEditing} value={this.state.timeEditing}
            autoFocus onBlur={this.textEditorTimeChange} />
        </div>
        ) : (
          <div className="time-text" onDoubleClick={() => this.changeEditingState(true)}>
            <span> {time} </span>
          </div>
        )

    return (
      <div className="time-control-wrapper">
        <CircleBtn
          className="time-control-btn minus-time"
          disabled={disabled}
          iconClassName="fas fa-minus"
          onClick={() => this.changeHandler(-SHOOT_SUBTITLE_TIME_MAJOR)}
        />

        <CircleBtn
          className="time-control-btn minus-time little"
          disabled={disabled}
          onClick={() => this.changeHandler(-SHOOT_SUBTITLE_TIME_MINOR)}
          iconClassName="fas fa-minus"
        />

        {timeElem}

        <CircleBtn
          className="time-control-btn add-time little"
          disabled={disabled}

          onClick={() => this.changeHandler(+SHOOT_SUBTITLE_TIME_MINOR)}
          iconClassName="fas fa-plus"
        />

        <CircleBtn
          className="time-control-btn add-time"
          disabled={disabled}
          onClick={() => this.changeHandler(+SHOOT_SUBTITLE_TIME_MAJOR)}
          iconClassName="fas fa-plus"
        />

        <CircleBtn
          className="time-control-btn add-time"
          disabled={disabled}
          onClick={() => this.changeHandler(null)}
          iconClassName="fas fa-angle-double-up"
        />
      </div>
    )
  }
}
