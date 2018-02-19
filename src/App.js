import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import Globe from './globe'
import DropZone from "./dropZone.js"

const $ = window.jQuery;

class App extends Component {
  render() {
    return (
        <div className="App">
          <DropZone>
              <Globe/>
          </DropZone>
        </div>
    );
  }
}

export default App;
