import React from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"

import { Intro, Studio, Help } from "./pages"
import { Toast } from "./components/form"

import "./global.sass"

export default class App extends React.Component {
  render() {
    return (
      <>
        <Router basename="/subtitle-editor">
          <Routes>
            <Route path="/" element={<Intro />}></Route>
            <Route path="/studio" element={<Studio />}></Route>
            <Route path="/help" element={<Help />}></Route>
          </Routes>
        </Router>
        <Toast />
      </>
    )
  }
}
