import React, { Component } from 'react'
import './App.css'

class App extends Component {

  constructor(props) {
    super(props)
  
    this.state = {
      session_length: 25,
      break_length: 5,
      time: 25 * 60,
      onSession: true,
      render_timer: undefined,
      playing: false,
      under_a_min: false
    }
    
    this.loop = undefined;

    this.calculated_time = this.calculate_time.bind(this);
    this.clock_logic = this.clock_logic.bind(this);
    this.clock_machine = this.clock_machine.bind(this);
    this.playPause = this.playPause.bind(this);
    this.reset = this.reset.bind(this);
    this.updateBrake = this.updateBrake.bind(this);
    this.updateSession = this.updateSession.bind(this);
  }

  componentDidMount() {
    // change value of render_timer
    this.clock_logic();
  }
  
  calculate_time(time_in_minutes) {
    let min = Math.floor(time_in_minutes / 60);
    let sec = time_in_minutes % 60;
    min = min.toString().padStart(2, '0');
    sec = sec.toString().padStart(2, '0');
    let calculated_time = `${min}:${sec}`;
    return calculated_time;
  }

  buzzerOn() {
    const audio = new Audio('https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav');
    audio.play();
  }

  clock_logic() {
    const {session_length, break_length, time, onSession} = this.state;
    let newSessionState = onSession;
    let newTime = time;
    let shouldWarn;

    if (time < 60 && time >= 0) {
      shouldWarn = true;
    } else {
      shouldWarn = false;
    }

    if (time === -1) {
      newSessionState = ! onSession;
      newTime = newSessionState ? session_length * 60 : break_length * 60; // bad naming, just means on session or on break?
    }
    let time_format = this.calculate_time(newTime);
    this.setState({
      time: newTime,
      onSession: newSessionState,
      render_timer: time_format,
      under_a_min: shouldWarn
    }, () => {if (time === 0) {this.buzzerOn()}})
  }

  clock_machine() {
    const {time} = this.state;
    this.setState({
      time: time - 1
    })
    this.clock_logic()
  }

  playPause() {
    // if playing, pause, else, play
    const {playing} = this.state;
    if (playing) {
      this.setState({
        playing: false
      }, () => {clearInterval(this.loop)})
    } else {
      this.setState({
        playing: true
      }, () => this.loop = setInterval(this.clock_machine, 1000))
    }
  }

  reset() {
    // window.location.reload()
    this.setState({
      session_length: 25,
      break_length: 5,
      time: 25 * 60,
      onSession: true,
      render_timer: undefined,
      playing: false
    }, () => {clearInterval(this.loop); this.clock_logic()})
  }

  updateBrake(operation) {
    const {break_length, onSession, time, playing} = this.state;
    const within_limit = operation === 'increment' ? break_length < 60 : break_length > 1;
    if (! playing && within_limit) {
      let newBreakLength = operation === 'increment' ? break_length + 1 : break_length - 1;
      let newTime = ! onSession && operation === 'increment' ? time + 60
        : ! onSession && operation === 'decrement' ? time - 60
        : time;
      this.setState({
        break_length: newBreakLength,
        time: newTime
      }, () => this.clock_logic());
    }
  }

  updateSession(operation) {
    const {session_length, onSession, time, playing} = this.state;
    const within_limit = operation === 'increment' ? session_length < 60 : session_length > 1;
    if (! playing && within_limit) {
      let newSessionLength = operation === 'increment' ? session_length + 1 : session_length - 1;
      let newTime = onSession && operation === 'increment' ? time + 60
        : onSession && operation === 'decrement' ? time - 60
        : time;
      this.setState({
        session_length: newSessionLength,
        time: newTime
      }, () => this.clock_logic());
    }
  }

  render() {
    const {session_length, break_length, render_timer, onSession, playing, under_a_min} = this.state;

    const play_symbol = <i class="fas fa-play"></i>
    const pause_symbol = <i class="fas fa-pause"></i>
    const reset_symbol = <i class="fas fa-sync"></i>

    return (
      <div id="App">

        <h1 id="app-title">Pomodoro Clock 🍅</h1>

        <div id="container">

          <div id="length-input">

            <div id="break-length">
              <h3 className="length-label" id="break-label">Break Length</h3>
              <button className="counter" id="break-decrement" onClick={() => this.updateBrake('decrement')}>-</button>
              <span className="length-value screen" id="break-length">{break_length}</span>
              <button className="counter" id="break-increment" onClick={() => this.updateBrake('increment')}>+</button>
            </div>

            <div id="session-length">
              <h3 className="length-label" id="session-label">Session Length</h3>
              <button className="counter" id="session-decrement" onClick={() => this.updateSession('decrement')}>-</button>
              <span className="length-value screen" id="session-length">{session_length}</span>
              <button className="counter" id="session-increment" onClick={() => this.updateSession('increment')}>+</button>
            </div>

          </div>

          <div id="timer">

            <div id="timer-render">
              <h3 id="timer-label">{onSession ? "Session" : "Break"}</h3>
              <h3 className={under_a_min ? "red-font screen" : "black-font screen"} id="time-left">{render_timer}</h3>
            </div>

            <div id="timer-status">
              <button className="status-btn" id="start_stop" onClick={this.playPause}>{playing ? pause_symbol : play_symbol}</button>
              <button className="status-btn" id="reset" onClick={this.reset}>{reset_symbol}</button>
            </div>

          </div>

        </div>

      </div>
    )
  }
}

export default App
