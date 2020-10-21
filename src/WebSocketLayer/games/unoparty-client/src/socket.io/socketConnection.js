import io from 'socket.io-client';

//This component is imported into login form
//When the username becomes available/not null in the state. the socket connetion is activated
const socket = username =>
  io({
    query: {
      username
    }
  });

export default socket;
