import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { selectCurrentGame } from '../../redux/games/games.selectors';
import { selectPlayerName } from '../../redux/player/player.selector';

import './opponentHand.styles.css';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import UnoCardBackside from '../unoCardBackside/unoCardBackside';
import PlayerAvatar from '../playerAvatar/playerAvatar';

const OpponentHand = ({ currentGame: { players }, playerName }) => {
  const renderOpponentCards = () => {
    const cards = players
      .filter(player => player.name !== playerName && Object.keys(player.cards).length > 0)
      .map((player, idx) => {
        let cards = [];
        for (let i = 0; i < Object.keys(player.cards).length; i++) {
          cards.push(<UnoCardBackside key={i} additionalStyles={{width: "75px", height: "100px", marginLeft: "-30px"}} />);
        }
        console.log(cards)
        return (
          <div className="opponent-hand-cards" key={idx} style={{marginLeft: "30px", padding: "10px"}}>{cards}</div>
        );
      });
    return cards;
  };

  return <Fragment className="opponent-hand-container">{renderOpponentCards()}</Fragment>;
};

/*
  <Col key={idx} className="opponent-hand-col">
    <div className="opponent-hand">      
      <PlayerAvatar additionalStyles={{ margin: '0 auto', marginBottom: '10px' }}>
        {player.name}
      </PlayerAvatar>        
      <div className="opponent-hand-cards" key={idx}>{cards}</div>        
    </div>
  </Col>               
*/


const mapStateToProps = createStructuredSelector({
  currentGame: selectCurrentGame,
  playerName: selectPlayerName
});

export default connect(mapStateToProps)(OpponentHand);
