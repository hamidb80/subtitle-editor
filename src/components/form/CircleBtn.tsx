import React, { MouseEvent } from 'react'

type Props = {
  text?: string
  className?: string
  iconClassName: string
  disabled?: boolean
  onClick: (me: MouseEvent) => void
}

class CircleBtn extends React.Component<Props> {

  render() {
    return (<>
      <div className={"d-inline-block " + this.props.className}>
        <button className={"btn circle-btn add-caption-btn " + (this.props.disabled ? 'disabled' : '')}
          onClick={this.props.onClick}>
          <span className={this.props.iconClassName}></span>
        </button>

        {this.props.text ? (
          <div className="badge">
            <span> {this.props.text} </span>
          </div>
        ) : ''}
      </div>
    </>)
  }
}

export default CircleBtn
