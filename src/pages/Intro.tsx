import React from 'react'
import {Link  } from "react-router-dom";
import FileInput from "../components/form/FileInput"
import appStates from "../utils/states"

class Intro extends React.Component {

  constructor(props: any) {
    super(props)

    this.state = {}

    this.handler = this.handler.bind(this)
  }

  handler(f: File, fileType: "video" | "subtitle") {
    const blob = URL.createObjectURL(f)

    if (fileType === 'video')
      appStates.videoFile.setData(blob)
    else
      appStates.subtitleFile.setData(blob)

    console.log(blob)
  }

  render() {
    return (<>
      <h2 className="page-title" >Intro</h2>
      <div className="wrapper">

        <div>
          <span>video file:</span>
          <FileInput onChange={f => this.handler(f, 'video')} />
        </div>

        <div className="mt-3">
          <span>subtitle file:</span>
          <FileInput onChange={f => this.handler(f, 'subtitle')} />
        </div>

        <div className="alert alert-warning" role="alert">
          if you don't select a subtitle file, we make new one
        </div>

        <div className="center">
          <Link to="/studio" >
            <button className="btn btn-success font-weight-bold">
              go next
            </button>
          </Link>
        </div>

      </div></>
    )
  }
}

export default Intro