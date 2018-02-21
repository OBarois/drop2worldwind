import React, { Component } from 'react';
import './App.css';
import Globe from './globe'
import DropZone from "./dropZone.js"

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
