import React from 'react'
import './help.sass'

import captionDrag from '../assets/captionDrag.gif'
import TCtrolImg from '../assets/TimeControll.jpg'
import StickTimeImg from '../assets/stickTime.png'
import TextAlignImg from '../assets/textAlign.png'
import addNewCap2Last from '../assets/addNewCaptionToEndOfLastOne.jpg'
import resizeVideo from '../assets/resizeVideo.png'

type State = {
  shortcuts: {
    keys: string[],
    clue: string,
  }[],
  features: {
    imageSrc: string,
    details: string
  }[],
}
export default class Help extends React.Component<{}, State> {
  state: State = {
    shortcuts: [
      {
        keys: ['ctrl', 'space'],
        clue: 'play/pause video player',
      },
      {
        keys: ['ctrl', 'right/left'],
        clue: 'go forward/backward in timeline [small step]',
      },
      {
        keys: ['ctrl', 'shift', 'right/left'],
        clue: 'go forward/backward in timeline [big step]',
      },
      {
        keys: ['ctrl', '+/-'],
        clue: 'zoom in/out in timeline',
      },
      {
        keys: ['ctrl', 'shift', '+/-'],
        clue: 'zoom in/out web page',
      },
      {
        keys: ['ctrl', '6/7'],
        clue: 'go to [start of last caption]/[end of next caption]',
      },
      {
        keys: ['ctrl', 'down'],
        clue: 'select current caption',
      },
      {
        keys: ['escape'],
        clue: 'unselect selected caption',
      },

      {
        keys: ['tab', 'left/right'],
        clue: 'shoot end of selected caption forward/backward',
      },
      {
        keys: ['alt', 'left/right'],
        clue: 'shoot start of selected caption forward/backward',
      },
      {
        keys: ['ctrl', '8/9'],
        clue: 'shoot start/end of selected caption to the current time',
      },
      {
        keys: ['ctrl', 'enter'],
        clue: 'create new caption',
      },
      {
        keys: ['enter'],
        clue: 'updates caption value, it works automatically when you switch between captions too',
      },
      {
        keys: ['ctrl', 'delete'],
        clue: 'delete selected caption',
      },
      {
        keys: ['ctrl', '0'],
        clue: 'toggle text direction in caption editor input [left to right]/[right to left]',
      },
      {
        keys: ['ctrl', 'z/y'],
        clue: 'undo/redo',
      },
      {
        keys: ['ctrl', 's'],
        clue: 'save subtitle',
      },
    ],

    features: [
      {
        imageSrc: captionDrag,
        details: `you can drag head/tail of the captions to extend/limit the timing of the caption. 
        dragCaption.GIF                  you can also drag center of the caption to move caption forward/backward in time.`
      },
  
      {
        imageSrc: TCtrolImg,
        details: `you can change timestamp manually by double clicking on it
        changes will be applied after clicking out of the timestamp`
      },
      {
        imageSrc: StickTimeImg,
        details: "use stick time button to stick start/end of selected caption to the timeline cursor"
      },
      {
        imageSrc: TextAlignImg,
        details: "you can change text align according to the language you write in"
      },
      {
        imageSrc: addNewCap2Last,
        details: "if you add a new caption to the last 600ms of the last caption, the new caption will be inserted after last one"
      },
      {
        imageSrc: resizeVideo,
        details: "you can resize video by draging the thin line after video and before caption view"
      }
    ]
  }

  render() {
    return (<>
      <h2 className="page-title">Help</h2>
      <div className="wrapper">

        <h3> <a href="#features">#features</a> </h3>
        <ul id="features">
          {this.state.features.map(f => <li>
            <img src={f.imageSrc} className="d-block" alt="" />
            <span> {f.details} </span>
          </li>)}
        </ul>

        <h3> <a href="#shortcuts">#shortcuts</a> </h3>
        <ul id="shortcuts">
          {this.state.shortcuts.map(sh => (
            <li className="shortcut d-flex justify-content-between">
              <span className="keys">
                {sh.keys.map((k, i) => <>
                  {i !== 0 ? <span className="plus">+</span> : ''}
                  <code className="key">{k}</code>
                </>)}
              </span>

              <span className="clue"> {sh.clue} </span>
            </li>
          ))}

        </ul>

      </div></>)
  }
}
