import React from 'react'
import './help.sass'

type State = {
  shortcuts: {
    keys: string[],
    clue: string,
  }[]
}
class Help extends React.Component<{}, State> {
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
        keys: ['ctrl', '+/-'],
        clue: 'zoom in/out in timeline',
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
        keys: ['ctrl', 'enter'],
        clue: 'create new caption',
      },
      {
        keys: ['ctrl', 'delete'],
        clue: 'delete selected caption',
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
        
        {this.state.shortcuts.map(sh => (
          <div className="shortcut d-flex justify-content-between">
            <span className="keys">
              {sh.keys.map((k, i) => <>
                {i !== 0 ? <span className="plus">+</span> : ''}
                <code className="key">{k}</code>
              </>)}
            </span>

            <span className="clue"> {sh.clue} </span>
          </div>
        ))}

      </div></>)
  }
}

export default Help