import React from 'react';
import logo from './logo.svg';
import './App.css';
import WebRTC from './components/webRTC';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <WebRTC/>

      </header>

    </div>
  );
}

export default App;
