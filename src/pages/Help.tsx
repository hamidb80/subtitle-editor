import React from 'react'
import './help.sass'

import TCtrolImg from '../assets/TimeControll.jpg'
import StickTimeImg from '../assets/stickTime.png'

type State = {
  shortcuts: {
    keys: string[],
    clue: string,
  }[]
}
export default class Help extends React.Component<{}, State> {
  state = {
    shortcuts: [
      {
        keys: ['ctrl', 'enter'],
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
        keys: ['home/end'],
        clue: 'shoot time to start/end of the video',
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
        keys: ['ctrl','home/end'],
        clue: 'shoot start/end of selected caption to the current time',
      },
      {
        keys: ['ctrl', 'enter'],
        clue: 'create new caption',
      },
      {
        keys: ['ctrl', 'delete'],
        clue: 'delete selected caption',
      },
      {
        keys: ['ctrl', '[/]'],
        clue: 'set text direction in caption editor input left-to-right/right-to-left',
      },

      {
        keys: ['ctrl', 'z/y'],
        clue: 'undo/redo',
      },

      {
        keys: ['ctrl', 's'],
        clue: 'save subtitle',
      },
    ]
  }

  render() {
    return (<>
      <h2 className="page-title">Help</h2>
      <div className="wrapper">

        <h3> <a href="#features">#features</a> </h3>
        <ul id="features">

          <li>
            <img src={TCtrolImg} height="180" className="d-block" alt="" />
            <span>
              you can change timestamp manually by double clicking on it
              changes will be applied after clicking out of the timestamp
            </span>
          </li>

          <li>
            <img src={StickTimeImg} height="180" className="d-block" alt="" />
            <span>
              use stick time button to stick start/end of selected caption to the timeline cursor
            </span>
          </li>

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