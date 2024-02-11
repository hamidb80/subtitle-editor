import React from 'react'

export type ToastData = {
  kind: "danger" | "warning" | "success"
  message: string,
  duration: number
}

export function pushToast(t: ToastData) {
  const ev = new CustomEvent('toast', { detail: t })
  window.dispatchEvent(ev)
}

type State = {
  isOpen: boolean,
  timerId: number,

  lastMessage: ToastData
}
export default class Toast extends React.Component<{}, State> {
  constructor(props: any) {
    super(props)

    this.state = {
      isOpen: false,
      timerId: 0,
      lastMessage: { kind: "success", message: "", duration: 0 }
    }

    this.disableToast = this.disableToast.bind(this)
    this.cancelToast = this.cancelToast.bind(this)
    this.cancelTimer = this.cancelTimer.bind(this)
  }

  // --------------- functionalities ----------------
  cancelTimer() {
    if (this.state.timerId) {
      clearTimeout(this.state.timerId)
      this.setState({ timerId: 0 })
    }
  }

  cancelToast() {
    this.cancelTimer()
    this.setState({ isOpen: false })
  }

  disableToast(timeout: number) {
    this.cancelTimer()

    this.setState({
      timerId: window.setTimeout(this.cancelToast, timeout)
    })
  }

  // ------------------ component API ----------------------

  componentDidMount() {
    // @ts-ignore
    window.addEventListener('toast', (ev: CustomEvent<ToastData>) => {
      this.setState({ lastMessage: ev.detail, isOpen: true })
      this.disableToast(ev.detail.duration)
    })
  }

  componentWillUnmount() {
    // @ts-ignore
    // window.removeEventListener('toast')
  }

  render() {
    const s = this.state
    return (<>
      <div className={"fixed-bottom m-4 alert " +
        `alert-${s.lastMessage.kind} ${s.isOpen ? "" : "d-none"}`}>
        <button className="close" onClick={this.cancelToast}>&times;</button>
        <strong>{s.lastMessage.message}</strong>
      </div>
    </>)
  }
}

