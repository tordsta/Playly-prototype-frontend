import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import { ReactReduxContext, Provider } from 'react-redux';

import store from './redux/store';

//import './index.css';

import App from './App';
import { render } from 'react-dom';

const UnoContext = React.createContext();

//this should all be in the translator
function Game(){
  return(
      <Provider store = {store}>
        <MemoryRouter>
          <App/>
        </MemoryRouter>
      </Provider>
  );
}

export default Game;

