import socket from 'socket.io-client'

const io = socket('http://localhost:3001')

export default io;