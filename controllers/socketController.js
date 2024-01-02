
const { Server } = require('socket.io')
const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*'
        }
    });

    io.on('connection', (socket) => {
        console.log('A user1 connected');

        socket.on('privateMessage', ({ targetUser, message }) =>{
            socket.to(targetUser).emit('privateMessage', socket.id, message);
        });
        socket.on('disconnect', () => {
            console.log('User disconnected');
                io.emit('quit', socket.id)
        });

        // 添加其他 Socket.IO 事件处理逻辑
    });

    return io;
};

module.exports = initializeSocket;