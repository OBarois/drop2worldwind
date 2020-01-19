import React from 'react'

// Re-usable DropZone component
class DropZone extends React.Component {
    constructor() {
      super();
      this.state = {
        className: 'drop-zone-hide'
      }
      this._onDragEnter = this._onDragEnter.bind(this);
      this._onDragLeave = this._onDragLeave.bind(this);
      this._onDragOver = this._onDragOver.bind(this);
      this._onDrop = this._onDrop.bind(this);
      this._onPaste = this._onPaste.bind(this);
    }
    
    componentDidMount() {
      window.addEventListener('mouseup', this._onDragLeave);
      window.addEventListener('dragenter', this._onDragEnter);
      window.addEventListener('dragover', this._onDragOver);
      document.getElementById('dragbox').addEventListener('dragleave', this._onDragLeave);
      window.addEventListener('drop', this._onDrop);
      window.addEventListener('paste', this._onPaste);
    }
    
    componentWillUnmount() {
      window.removeEventListener('mouseup', this._onDragLeave);
      window.removeEventListener('dragenter', this._onDragEnter);
      window.addEventListener('dragover', this._onDragOver);
      document.getElementById('dragbox').removeEventListener('dragleave', this._onDragLeave);
      window.removeEventListener('drop', this._onDrop);
      window.removeEventListener('paste', this._onPaste);

    }
    
    _onDragEnter(e) {
      this.setState({ className: 'drop-zone-show' });
      e.stopPropagation();
      e.preventDefault();
      return false;
    }
    
    _onDragOver(e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    _onDragLeave(e) {
      this.setState({className: 'drop-zone-hide'});
      e.stopPropagation();
      e.preventDefault();
      return false;
    }
    
    _onDrop(e) {
      e.preventDefault();
      //console.log("dropped text: " + e.dataTransfer.getData("Text"));

        
        if(e.dataTransfer.getData("Text").length != 0) {
          this.refs.child0.handleDropText(e.dataTransfer.getData("Text"));
        } else {
          this.refs.child0.handleDropFiles(e.dataTransfer.files);
        }
        this.setState({className: 'drop-zone-hide'});
      
      return false;
    }

    _onPaste(e) {
      e.preventDefault();
      //console.log(e.clipboardData.getData('Text') );
      this.refs.child0.handlePaste(e.clipboardData.getData('Text'));
      return false;
    }
    
    render() {
        const children = React.Children.map(this.props.children,
            (child, index) => React.cloneElement(child, {
                ref : `child${index}`
            })
         );
      
    
        return (
            <div>
                {children}
                <div id="dragbox" className={this.state.className}/>
            </div>
        );
    }
  }
  
  export default DropZone