import React, { Component } from 'react';
import './App.css';
import Globe from './globe'
import DropZone from "./dropZone.js"
import Fullscreen from "react-full-screen";
import SlideMenu from "./slideMenu.js"


class App extends Component {

  constructor(props) {
    super();
 
    this.state = {
      isFull: false,
      autoRefreshSearch: false
    };
    this.goFull = this.goFull.bind(this);
    this.handleKey = this.handleKey.bind(this);
  }

  
  handleKey(e) {

    // this prevents the paste event to be overitten
    if (e.ctrlKey||e.metaKey) {
      return false;
    }

    e.preventDefault();
    switch (e.key) {
      case "f": {
        this.goFull();
        break;
      }
      default:
        break;
    }
    return false;
  }

  goFull() {
    this.setState({ isFull: true });
  }



  componentDidMount() {
    window.addEventListener('keydown', this.handleKey);
  }
  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKey);
  }

  render() {
    return (
      <div  className="App">
        <Fullscreen enabled={this.state.isFull} onChange={isFull => this.setState({isFull})}>
          <SlideMenu/>
          <DropZone>
              <Globe projection={"3D"} autoRefreshSearch={this.state.autoRefreshSearch}></Globe>
          </DropZone>
        </Fullscreen>
      </div>
    );
  }
}

export default App;
