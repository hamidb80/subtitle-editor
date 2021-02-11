import React, { MouseEvent } from 'react'
// import '../../styles/components/caption-view.sass'

type Props = {
  text?: string
  onClick: (me: MouseEvent) => void
  className?: string
  iconClassName: string
}

class CircleBtn extends React.Component<Props> {
  constructor(props: any) {
    super(props)
  }

  render() {
    return (<>
      <div className={"d-inline-block " + this.props.className}>
        <button className="btn circle-btn add-caption-btn" onClick={this.props.onClick}>
          <span className={this.props.iconClassName}></span>
        </button>

        {this.props.text ? (
          <div className="badge">
            <span> {this.props.text} </span>
          </div>
        ) : ''
        }
      </div>
    </>)
  }
}

export default CircleBtn
