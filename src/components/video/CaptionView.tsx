import React from 'react'
import { Caption } from "../../utils/types"
import '../../styles/components/caption-view.sass'

type Props = {
  currentTime: number
  captions: Caption[]
  fullScreen?: boolean
}

class CaptionView extends React.Component<Props> {
  constructor(props: any) {
    super(props)

    this.getCaptionContent = this.getCaptionContent.bind(this)
  }

  getCaptionContent(): string {
    const t = this.props.currentTime
    const cap = this.props.captions.find((c: Caption) => t >= c.start && t <= c.end)

    return cap ? cap.content : ''
  }

  render() {
    const content = this.getCaptionContent()

    if (content === '')
      return <div className="caption-group"></div>

    else
      return (
        <div className={"caption-group " + (this.props.fullScreen ? 'fullscreen' : '')}>
          <div className="caption">
            {content}
          </div>
        </div>
      )
  }
}

export default CaptionView
