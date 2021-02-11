import React, { SyntheticEvent, MouseEvent } from 'react'

import "../../styles/components/video-player.sass"

type Props = {
    videoUrl: string
    onTimeUpdate?: (timePerSecond: number) => void
    onDurationChanges: (duration: number) => void
}

const videoControllHiddingDelay = 2

class VideoPlayer extends React.Component<Props> {
    videoElementRef: React.RefObject<HTMLVideoElement>
    timer: number = 0

    state: {
        lastStart: number
        showVideoControll: boolean
    }

    constructor(props: any) {
        super(props)

        this.state = {
            lastStart: 0,
            showVideoControll: false
        }

        this.videoElementRef = React.createRef()

        // --- register methods ---
        // events
        this.onTimeUpdate = this.onTimeUpdate.bind(this)
        this.onMouseMove = this.onMouseMove.bind(this)

        // actions
        this.setPlay = this.setPlay.bind(this)
        this.isPlaying = this.isPlaying.bind(this)
        this.disableVideoControllers = this.disableVideoControllers.bind(this)

        this.onDurationChanges = this.onDurationChanges.bind(this)
    }

    // ----------------------- events ------------------------

    onDurationChanges() {
        if (this.props.onDurationChanges) {
            const du = this.videoElementRef.current?.duration || 0
            this.props.onDurationChanges(du)
        }
    }

    onTimeUpdate(e: SyntheticEvent<HTMLVideoElement, Event>) {
        if (this.props.onTimeUpdate) {
            const currentTime = e.currentTarget.currentTime
            this.props.onTimeUpdate(currentTime)
        }
    }


    onContextmenu(e: MouseEvent<any>) {
        e.preventDefault()
    }

    onMouseMove(e: MouseEvent) {
        if (this.timer)
            clearTimeout(this.timer)

        this.setState({ showVideoControll: true })
        this.timer = +setTimeout(this.disableVideoControllers, videoControllHiddingDelay * 1000)
    }

    disableVideoControllers() {
        clearTimeout(this.timer)
        this.setState({ showVideoControll: false })
    }

    setTime(timePerSeconds: number) {
        const ve = this.videoElementRef.current
        if (ve) ve.currentTime = timePerSeconds
    }

    shootTime(seconds: number) {
        const ve = this.videoElementRef.current

        if (ve) {
            const currentTime = ve.currentTime
            this.setTime(currentTime + seconds)
        }
    }

    // --------------------- functions ----------------------

    setPlay(play: boolean) {
        if (this.videoElementRef.current) {
            if (play)
                this.videoElementRef.current?.play()
            else
                this.videoElementRef.current?.pause()
        }
    }

    isPlaying(): boolean {
        return Boolean(this.videoElementRef.current && !this.videoElementRef.current.paused)
    }

    // ------------------- component API ----------------


    render() {
        const isPlaying = this.isPlaying()

        return (
            <div className={"video-player " + (this.state.showVideoControll ? 'show ' : '')}
                onMouseMove={this.onMouseMove} onMouseOut={this.disableVideoControllers}>

                <div className="video-screen"
                    onContextMenu={this.onContextmenu}>

                    <video
                        onTimeUpdate={this.onTimeUpdate}
                        ref={this.videoElementRef}
                        src={this.props.videoUrl}
                        autoPlay={false}
                        loop={false}
                        onDurationChange={this.onDurationChanges}
                    ></video>

                    <div className={"video-state-controller"}>
                        <div className="part"></div>

                        <div className="part action-btn-group">
                            <div className="action-btn play-pause" onClick={() => this.setPlay(!isPlaying)}>
                                <span className={"icon fas fa-3x " + (isPlaying ? "fa-pause" : "fa-play")}>
                                </span>
                            </div>
                        </div>

                        <div className="part"></div>
                    </div>

                </div>
            </div>
        )
    }
}
export default VideoPlayer