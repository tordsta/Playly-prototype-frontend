import React, { useEffect, useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { createStructuredSelector } from 'reselect';
import { useTransition } from 'react-spring';

import { selectCurrentGame } from './redux/games/games.selectors';
import { selectSocketConnection } from './redux/socket/socket.selectors';
import { selectPlayerName } from './redux/player/player.selector';

import {
  updateAvailableGames,
  updateCurrentGame
} from './redux/games/games.actions';
import { setPlayerName } from './redux/player/player.actions';

import Container from 'react-bootstrap/Container';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.styles.css';

import Logo from './components/logo/logo';
import ProtectedRoute from './components/protectedRoute/protectedRoute';
import GameBrowserPage from './pages/gameBrowserPage/gameBrowserPage';
import GameLobbyPage from './pages/gameLobbyPage/gameLobbyPage';
import GamePage from './pages/gamePage/gamePage';
//import LoginForm from './components/loginForm/loginForm';
import Alert from './components/alert/alert';
import { setSocket } from './redux/socket/socket.actions';

const App = ({
  updateAvailableGames,
  updateCurrentGame,
  history,
  currentGame: { inLobby },
  socket,
  playerName,
  userID,
  wsSocket,
  roomKey,
  setSocket,
  setPlayerName,
  players
}) => {
  const [alert, setAlert] = useState(false);

  //Init for game variabels 
  useEffect(() =>{
    if(wsSocket){
      setSocket(wsSocket)
    } 
    if(userID){
      setPlayerName(userID)
    } 
  })
  
  function sendGameMessage(message){
    let gameMessage = ({type: "UNO_PARTY", roomKey: roomKey, senderID: userID, payload: message});
    wsSocket.send(JSON.stringify(gameMessage));
  }
  
  //Dont know where to put this yet
  /*
  const handleClick = roomId => {
    socket.emit('joinGame', { roomId });
  };
  
  <Button
    onClick={() => handleClick(roomId)}
    style={{ width: '100%' }}
    variant="success"
  >
    Join Game
  </Button>
  
  */

  useEffect(() => {
    if (socket) {

      wsSocket.addEventListener("message", function(event) {
        const data = JSON.parse(event.data);
        if(data.type == "UNO_PARTY"){
          console.log("Server is sending:", data.payload)
          if(data.payload.type == "joinedGame"){
            let game = data.payload.payload;
            console.log("app jsx game variable", game)
            updateCurrentGame(game);
            history.push('/lobby');
          }
          //case with types of messages


          //join game if not host

          

          //for the popup alert message, not important to implement
          
          //if message from listener does not equal any other message in the application,
          //set it to default as an alert

          /*
          socket.on('message', message => {
            setAlert(message);
          });
          */
        }
      })

    }
  }, [updateAvailableGames, updateCurrentGame, history, socket]);
  useEffect(() => {
    if (alert) {
      setTimeout(() => {
        setAlert(false);
      }, 3000);
    }
  }, [alert]);

  const transitions = useTransition(alert, alert.key, {
    config: { mass: 1, tension: 500, friction: 26 },
    from: { bottom: '-200px', opacity: 0 },
    enter: { bottom: '15px', opacity: 1 },
    leave: { bottom: '-200px', opacity: 0 }
  });

  return (
    <Container fluid className="app">
      {transitions.map(({ item, key, props }) => {
        return (
          item.message && (
            <Alert key={key} error additionalStyles={props}>
              {item.message}
            </Alert>
          )
        );
      })}
      <Logo
        watermark={history.location.pathname === '/' || inLobby ? false : true}
      />
      {socket && playerName ? (
        <Switch>
          <Route exact path="/">
            <GameBrowserPage lobbyName={roomKey} players={players} wsSocket={wsSocket} sendGameMessage={sendGameMessage} />
          </Route>
          <ProtectedRoute path="/lobby">
            <GameLobbyPage wsSocket={wsSocket} sendGameMessage={sendGameMessage} />
          </ProtectedRoute>
          <ProtectedRoute condition={inLobby} redirect="/lobby" path="/game">
            <GamePage wsSocket={wsSocket} sendGameMessage={sendGameMessage}/>
          </ProtectedRoute>
        </Switch>
      ) : (
        <p> Error: The Socket and/or PlayerName is not passed to the uno game</p>
      )}    
    </Container>
  );
};


const mapDispatchToProps = dispatch => ({
  updateAvailableGames: games => dispatch(updateAvailableGames(games)),
  updateCurrentGame: game => dispatch(updateCurrentGame(game)),
  setPlayerName: name => dispatch(setPlayerName(name)),
  setSocket: socket => dispatch(setSocket(socket))
});

const mapStateToProps = createStructuredSelector({
  currentGame: selectCurrentGame,
  socket: selectSocketConnection,
  playerName: selectPlayerName
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(App));
