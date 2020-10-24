import React from 'react';

import GameBrowser from '../../components/gameBrowser/gameBrowser';

const GameBrowserPage = ({lobbyName, players, wsSocket, sendGameMessage}) => {
  return <GameBrowser lobbyName={lobbyName} players={players} wsSocket={wsSocket} sendGameMessage={sendGameMessage}/>;
};

export default GameBrowserPage;
