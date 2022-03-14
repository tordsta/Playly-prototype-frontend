import React from 'react';

import Lobby from '../../components/lobby/lobby';

const GameLobbyPage = ({wsSocket, sendGameMessage}) => {
  return <Lobby wsSocket={wsSocket} sendGameMessage={sendGameMessage} />;
};

export default GameLobbyPage;
