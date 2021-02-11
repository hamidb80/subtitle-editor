import React, { FocusEvent, ChangeEvent } from 'react'
import { TimeControll } from "."

import { Caption } from "../../utils/types"

import '../../styles/components/caption-editor.sass'

type Props = {
    captions: Caption[]

    currentTime: number

    selectedCaption_i: number | null
    onCaptionChanged: (index: number, c: Caption) => void
    onCaptionDeleted: (index: number) => void

    replayTimeRange: () => void
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
        this.handleCaptionDelete = this.handleCaptionDelete.bind(this)
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
        this.setState({
            content2change: e.target.value
        })
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
            if (cap.start > cap.end)
            {
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

            cap.content = this.state.content2change

            this.props.onCaptionChanged(this.state.caption_i, cap)
        }
    }

    handleCaptionDelete() {
        if (this.props.selectedCaption_i !== null) {
            this.setState({ caption_i: null })
            this.props.onCaptionDeleted(this.props.selectedCaption_i)
        }
    }

    render() {
        let content: string = ''

        if (this.state.caption_i !== null) {
            // myabe not available
            let cap: Caption | null = null
            try {
                cap = this.props.captions[this.state.caption_i]
            }
            catch (err) { }
            if (!cap) return ''

            content = cap.content

            return (
                <div className="caption-step-editor-wrapper">
                    <TimeControll
                        time={cap.start}
                        onChange={changeValue => { this.onCaptionTimeRangeChange(changeValue, 0) }}
                    />

                    <div>
                        <button className="btn circle-btn mx-1" onClick={this.props.replayTimeRange}>
                            <span className="fas fa-play"></span>
                        </button>
                        <input type="text" className="caption-editor" value={this.state.content2change}
                            onChange={this.onCaptionContentChanged}
                            autoFocus onBlur={this.handleCaptionChange} />

                        <button className="btn circle-btn mx-1" onClick={this.handleCaptionDelete}>
                            <span className="fas fa-trash"></span>
                        </button>
                    </div>

                    <TimeControll
                        time={cap.end}
                        onChange={changeValue => { this.onCaptionTimeRangeChange(0, changeValue) }}
                    />
                </div>
            )
        }

        else {
            content = '!! nothing selected !!'

            return (
                <div className="caption-step-editor-wrapper">
                    <TimeControll time={0} />

                    <div className="caption-step-content">
                        <button className="btn circle-btn mx-1 disabled">
                            <span className="fas fa-play"></span>
                        </button>
                        <span> {content} </span>
                        <button className="btn circle-btn disabled">
                            <span className="fas fa-trash"></span>
                        </button>
                    </div>

                    <TimeControll time={0} />
                </div>
            )
        }
    }
}

export default CaptionEditor
