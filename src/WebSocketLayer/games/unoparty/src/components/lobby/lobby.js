import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { withRouter } from 'react-router-dom';

import {
  addPlayer,
  initGame,
  updateCurrentGameCurrentCard,
  clearCurrentGame,
  removePlayer,
  setCurrentGameHost
} from '../../redux/games/games.actions';

import { selectCurrentGame } from '../../redux/games/games.selectors';
import { selectSocketConnection } from '../../redux/socket/socket.selectors';
import { selectPlayerName } from '../../redux/player/player.selector';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';

import PlayerAvatar from '../playerAvatar/playerAvatar';
import CustomJumbotron from '../customJumbotron/customJumbotron';

import './lobby.styles.css';

const Lobby = ({
  currentGame,
  addPlayer,
  initGame,
  history,
  updateCurrentGameCurrentCard,
  socket,
  clearCurrentGame,
  removePlayer,
  setCurrentGameHost,
  wsSocket,
  sendGameMessage
}) => {
  const { maxPlayers, name, players, host, isHost, roomId } = currentGame;
  
  const startGame = roomId => {
    //socket.emit('startGame', roomId);
    sendGameMessage({type:"startGame", payload: {roomId: roomId}})
  };

  useEffect(() => {
    let gameStarted = false;
    
    wsSocket.addEventListener("message", function(event) {
      const data = JSON.parse(event.data);
      if(data.type == "UNO_PARTY"){
        //console.log("lobbyJS, server payload", data.payload)
        switch(data.payload.type){
          case "initGame":
            let players = data.payload.payload.players
            let currentCard = data.payload.payload.currentCard
            
            updateCurrentGameCurrentCard(currentCard);
            gameStarted = true;
            initGame(players);
            history.push('/game');
            break;
          
          case "playerJoin":
            let player = data.payload.payload.player
            addPlayer(player);
            break;
          
          case "newHost":
            let username = data.payload.payload.username
            setCurrentGameHost(username);
            break;
          
          case "playerLeave":
            let playerIdx = data.payload.payload.playerIdx
            removePlayer(playerIdx);
            break;

          default:
            //console.log("Defult switch activated at lobby.js", data.payload)
        }
  
      }
    })
  
    /*
    socket.on('initGame', data => {
      socket.on('currentCard', card => {
        updateCurrentGameCurrentCard(card);
        gameStarted = true;
        initGame(data);
        history.push('/game');
      });
    });
*/

    return () => {
      /*
      socket.off('initGame');
      socket.off('currentCard');
      socket.off('playerJoin');
      socket.off('playerLeave');
      socket.off('newHost');
      */
      if (!gameStarted) {
        sendGameMessage({type: "leaveRoom"});
        //socket.emit('leaveRoom');
        clearCurrentGame();
      }
    };
  }, [
    addPlayer,
    history,
    initGame,
    updateCurrentGameCurrentCard,
    socket,
    clearCurrentGame,
    removePlayer,
    setCurrentGameHost
  ]);
  return (
    <Row className="lobby">
      <Col xl="6" sm="12">
        <CustomJumbotron className="bg-dark lobby-jumbotron">
          <h1 className="lobby-name">Game: {name}</h1>
          <Row className="lobby-details">
            <Col sm="6" className="lobby-players">
              {players.map(player => (
                <PlayerAvatar key={player.name}>{player.name}</PlayerAvatar>
              ))}
            </Col>
            <Col sm="6">
              <h2>Game Info:</h2>
              <p>Host: {host}</p>
              <p>Max Players: {maxPlayers}</p>
              <p>Password Protected: false</p>
              <Badge variant="secondary">Waiting for host</Badge>
              {isHost ? (
                <Button onClick={() => startGame(roomId)} variant="success">
                  Start Game
                </Button>
              ) : null}
            </Col>
          </Row>
        </CustomJumbotron>
      </Col>
    </Row>
  );
};

const mapStateToProps = createStructuredSelector({
  currentGame: selectCurrentGame,
  socket: selectSocketConnection,
  playerName: selectPlayerName
});

const mapDispatchToProps = dispatch => ({
  addPlayer: player => dispatch(addPlayer(player)),
  initGame: players => dispatch(initGame(players)),
  updateCurrentGameCurrentCard: card =>
    dispatch(updateCurrentGameCurrentCard(card)),
  clearCurrentGame: () => dispatch(clearCurrentGame()),
  removePlayer: playerIdx => dispatch(removePlayer(playerIdx)),
  setCurrentGameHost: username => dispatch(setCurrentGameHost(username))
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Lobby));
