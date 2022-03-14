import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import {
  playCard,
  addPlayerCard,
  removePlayer,
  updateCurrentGame,
  clearCurrentGame
} from '../../redux/games/games.actions';

import { selectSocketConnection } from '../../redux/socket/socket.selectors';

import './gamePage.styles.css';

import OpponentHand from '../../components/opponentHand/opponentHand';
import CurrentUserHand from '../../components/currentUserHand/currentUserHand';
import Deck from '../../components/deck/deck';

const GamePage = ({
  playCard,
  addPlayerCard,
  socket,
  removePlayer,
  updateCurrentGame,
  clearCurrentGame,
  wsSocket,
  sendGameMessage
}) => {
  useEffect(() => {
    let gameFinished = false;

    wsSocket.addEventListener("message", function(event) {
      const data = JSON.parse(event.data);
      if(data.type == "UNO_PARTY"){
        let payload = data.payload.payload
        switch(data.payload.type){
          case"cardPlayed":
            const {
              cardPlayerIndex,
              cardIndex,
              currentPlayerTurnIndex,
              currentCard
            } = payload;
            playCard(cardPlayerIndex, cardIndex, currentPlayerTurnIndex, currentCard);
            break;

          //The opponents used to only have a number indicating their cards
          //In this implementasion all the cards are js objects, the original have the information from gameInit
          case"drawnCard":
            const { playerIdx, randomCards, numCards } = payload;
            addPlayerCard(playerIdx, randomCards, numCards);
            break;

          case"playerLeave":
            playerIdx = payload.playerIdx;
            removePlayer(playerIdx);
            break;

          case"gameFinished":
            
            gameFinished = true;
            updateCurrentGame(currentGame);
            break;
        }
      }
    });
    /*
    socket.on('cardPlayed', data => {
      const {
        cardPlayerIndex,
        cardIndex,
        currentPlayerTurnIndex,
        currentCard
      } = data;
      playCard(cardPlayerIndex, cardIndex, currentPlayerTurnIndex, currentCard);
    });
    socket.on('drawnCard', ({ playerIdx, randomCards, numCards }) => {
      addPlayerCard(playerIdx, randomCards, numCards);
    });

    socket.on('playerLeave', playerIdx => {
      removePlayer(playerIdx);
    });

    socket.on('gameFinished', currentGame => {
      gameFinished = true;
      updateCurrentGame(currentGame);
    });
    */

    return () => {
      /*
      socket.off('cardPlayed');
      socket.off('drawnCard');
      socket.off('playerLeave');
      socket.off('gameFinished');
      */

      if (!gameFinished) {
        sendGameMessage({type: "leaveRoom"})
        //socket.emit('leaveRoom');
        clearCurrentGame();
      }
    };
  }, [
    playCard,
    addPlayerCard,
    socket,
    removePlayer,
    updateCurrentGame,
    clearCurrentGame
  ]);
  const gridPosition1 = {
    gridColumnStart: "1", 
    gridColumnEnd: "2",
    gridRowStart: "1", 
    gridRowEnd: "2"
  }
  const gridPosition2 = {
    gridColumnStart: "3", 
    gridColumnEnd: "4",
    gridRowStart: "1", 
    gridRowEnd: "2"
  }
  const gridPosition3 = {
    gridColumnStart: "3", 
    gridColumnEnd: "4",
    gridRowStart: "3", 
    gridRowEnd: "4"
  }
  const posArray = [gridPosition1, gridPosition2, gridPosition3]

  return (
    <div 
      className="game-container" 
      style={{
        display: "grid", 
        gridTemplateRows: "100px 100px 100px", 
        gridTemplateColumns: "1fr 1fr 1fr"
      }}>
      <OpponentHand gridPos={posArray}/>
      <Deck 
        sendGameMessage={sendGameMessage} 
        style={{
          gridColumnStart: "2", 
          gridColumnEnd: "3",
          gridRowStart: "1", 
          gridRowEnd: "4"
      }}/>
      <CurrentUserHand 
        wsSocket={wsSocket} 
        sendGameMessage={sendGameMessage}
      />
    </div>
  );
};

const mapDispatchToProps = dispatch => ({
  playCard: (cardPlayerIndex, cardIndex, currentPlayerTurnIndex, currentCard) =>
    dispatch(
      playCard(cardPlayerIndex, cardIndex, currentPlayerTurnIndex, currentCard)
    ),
  addPlayerCard: (playerIdx, cards, numCards) =>
    dispatch(addPlayerCard(playerIdx, cards, numCards)),
  removePlayer: playerIdx => dispatch(removePlayer(playerIdx)),
  updateCurrentGame: currentGame => dispatch(updateCurrentGame(currentGame)),
  clearCurrentGame: () => dispatch(clearCurrentGame())
});

const mapStateToProps = createStructuredSelector({
  socket: selectSocketConnection
});

export default connect(mapStateToProps, mapDispatchToProps)(GamePage);
