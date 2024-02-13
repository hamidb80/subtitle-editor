import React, { SyntheticEvent, MouseEvent } from "react"

import "./video-player.sass"

const videoControllHiddingDelay = 2

type Props = {
  videoUrl: string
  onTimeUpdate: (timePerSecond: number) => void
  onError: (e: SyntheticEvent) => void
  onDurationChanges: (duration: number) => void
  height: number
  onLoad: () => void
}
export default class VideoPlayer extends React.Component<Props> {
  ref: React.RefObject<HTMLVideoElement>
  timer: number = 0 // for settimeout

  state: {
    lastStart: number
    showVideoControll: boolean
  }

  constructor(props: any) {
    super(props)

    this.state = {
      lastStart: 0,
      showVideoControll: false,
    }

    this.ref = React.createRef()

    // --- register methods ---
    // events
    this.onTimeUpdate = this.onTimeUpdate.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onError = this.onError.bind(this)

    // actions
    this.setPlay = this.setPlay.bind(this)
    this.isPlaying = this.isPlaying.bind(this)
    this.disableVideoControllers = this.disableVideoControllers.bind(this)

    this.onDurationChanges = this.onDurationChanges.bind(this)
  }

  // ----------------------- events ------------------------

  onDurationChanges() {
    // emit signal
    if (this.props.onDurationChanges) {
      const du = this.ref.current?.duration || 0
      this.props.onDurationChanges(du)
    }
  }

  onTimeUpdate(e: SyntheticEvent<HTMLVideoElement, Event>) {
    if (this.props.onTimeUpdate) {
      const currentTime = e.currentTarget.currentTime
      this.props.onTimeUpdate(currentTime)
    }
  }

  onMouseMove(_: MouseEvent) {
    if (this.timer) clearTimeout(this.timer)

    this.setState({ showVideoControll: true })
    this.timer = +setTimeout(
      this.disableVideoControllers,
      videoControllHiddingDelay * 1000
    )
  }

  onError(e: SyntheticEvent) {
    if (this.props.onError) this.props.onError(e)
  }

  // // ----------------------- functions ------------------------

  disableVideoControllers() {
    clearTimeout(this.timer)
    this.setState({ showVideoControll: false })
  }

  setTime(timePerSeconds: number) {
    const ve = this.ref.current
    if (ve) ve.currentTime = timePerSeconds
  }

  shootTime(seconds: number) {
    const ve = this.ref.current

    if (ve) {
      const currentTime = ve.currentTime
      this.setTime(currentTime + seconds)
    }
  }

  setPlay(play: boolean) {
    if (this.ref.current) {
      if (play) this.ref.current?.play()
      else this.ref.current?.pause()
    }
  }

  togglePlay() {
    this.setPlay(!this.isPlaying())
  }

  isPlaying(): boolean {
    return Boolean(this.ref.current && !this.ref.current.paused)
  }

  // -------------------------- component API ---------------------------
  render() {
    const isPlaying = this.isPlaying()

    return (
      <div
        className={
          "video-player " + (this.state.showVideoControll ? "show " : "")
        }
        onMouseMove={this.onMouseMove}
        onMouseOut={this.disableVideoControllers}
      >
        <div className="video-screen" onContextMenu={(e) => e.preventDefault()}>
          <video
            height={this.props.height}
            onTimeUpdate={this.onTimeUpdate}
            ref={this.ref}
            src={this.props.videoUrl}
            autoPlay={false}
            loop={false}
            onDurationChange={this.onDurationChanges}
            onError={(e) => this.onError(e)}
            onLoadedData={(_) => this.props.onLoad()}
          ></video>

          <div className="video-state-controller">
            <div className="part"></div>

            <div className="part action-btn-group">
              <div
                className="action-btn play-pause"
                onClick={() => this.setPlay(!isPlaying)}
              >
                <span
                  className={
                    "icon fas fa-3x " + (isPlaying ? "fa-pause" : "fa-play")
                  }
                ></span>
              </div>
            </div>

            <div className="part"></div>
          </div>
        </div>
      </div>
    )
  }
}
