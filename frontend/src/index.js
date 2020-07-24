import React, {Component} from 'react' 
import ReactDOM from 'react-dom'
import LocalVideoSteam from './localVideoSteam';


class App extends Component {
  render() {
    return (
      <div>This is a React component inside of Webflow!<br/><br/>
        
        Your video steam <br/>
        <LocalVideoSteam/>

        Remote video stream <br/>


      </div>     
    )
  }
}

ReactDOM.render(
React.createElement(App, {}, null),
document.getElementById('react-target')
);