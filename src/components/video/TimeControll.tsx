import React, { ChangeEvent, FocusEvent } from 'react'
import { second2timestamp, timestamp2seconds } from "../../utils/timestamp"

import '../../styles/components/time-controll.sass'

type Props = {
  time: number // per seconds
  onChange?: (changedValue: number | null) => void
}
type State = {
  isEditing: boolean
  timeEditing: string
}

class TimeControll extends React.Component<Props, State> {
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

    try {
      newTime = timestamp2seconds(newTimeString)
    } catch (error) { return }

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
    const disabled = this.props.onChange === undefined
    const time = second2timestamp(this.props.time, "complete")

    const timeElem = this.state.isEditing ?
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
        <button
          className={"btn circle-btn time-control-btn minus-time " + (disabled ? 'disabled' : '')}
          onClick={() => this.changeHandler(-1)}>
          <span className="fas fa-minus"></span>
        </button>

        <button
          className={"btn circle-btn time-control-btn minus-time little " + (disabled ? 'disabled' : '')}
          onClick={() => this.changeHandler(-0.1)}>
          <span className="fas fa-minus"></span>
        </button>

        {timeElem}

        <button
          className={"btn circle-btn time-control-btn add-time little " + (disabled ? 'disabled' : '')}
          onClick={() => this.changeHandler(+0.1)}>
          <span className="fas fa-plus"></span>
        </button>

        <button className={"btn circle-btn time-control-btn add-time " + (disabled ? 'disabled' : '')}
          onClick={() => this.changeHandler(+1)}>
          <span className="fas fa-plus"></span>
        </button>

        <button className={"btn circle-btn time-control-btn add-time " + (disabled ? 'disabled' : '')}
          onClick={() => this.changeHandler(null)}>
          <span className="fas fa-angle-double-up"></span>
        </button>
      </div>
    )
  }
}

export default TimeControll
