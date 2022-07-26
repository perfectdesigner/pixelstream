const CONNECTION = 'connection'
const EVENT_CALL = 'call'
const EVENT_OFFER = 'offer'
const EVENT_ANSWER = 'answer'
const EVENT_CANDIDATE = 'candidate'
const EVENT_DISCONNECTING = 'disconnecting'
const EVENT_DISCONNECT = 'disconnect'

const CREATE_ROOM = "create-room"
const UPDATE_ROOM_LIST = "update-room-list"
const JOIN_ROOM = "join-room"
const ROOM_CLOSED = "room-closed"
const USER_LEAVE_ROOM = 'user-leave-room'
const LEAVE_ROOM = 'leave-room'

class SocketService {
    constructor(http) {
        this.init(http)
        this.rooms = {}
    }

    drop_room (room) {
        this.io.to(room).emit(ROOM_CLOSED, { name : room })
        var ids = this.io.sockets.adapter.rooms.get(room)
        
        if (ids != null) {
            ids.forEach( (id) => {
                try {
                    this.io.sockets.get(id).leave(room)
                } catch (e) {
                }
            })
        }

        delete this.rooms[room]
        this.io.emit(UPDATE_ROOM_LIST, Object.keys(this.rooms))
    }

    init(http) {
        var service = this
        this.io = require('socket.io')(http)

        this.io.on(CONNECTION, (socket) => {
            /**
             * Create a new room request
             */
            socket.on(CREATE_ROOM, (data) => {
                if(data.name == null || data.name.trim() == '') {
                    socket.emit(CREATE_ROOM, {
                        created : false
                    })
                } else if( data.name in this.rooms ) {
                    socket.emit(CREATE_ROOM, {
                        created : false,
                        error : "Já existe uma sala com este nome"
                    })
                } else {
                    this.rooms[data.name] = {
                        name : data.name,
                        owner : socket.id,
                        owner_name : data.owner_name,
                        socket
                    }

                    socket.join(data.name)

                    socket.emit(CREATE_ROOM, {
                        created: true,
                        room: {
                            name: data.name,
                            owner_name: data.owner_name
                        }
                    })

                    this.io.emit(UPDATE_ROOM_LIST, Object.keys(this.rooms))
                }
            })
            /**
             * Return all rooms created
             */
            socket.emit(UPDATE_ROOM_LIST, Object.keys(this.rooms))
            /**
             * On user disconnect
             */
            socket.on(EVENT_DISCONNECT, () => {
                Object.keys(this.rooms).forEach(room => {
                    if (this.rooms[room].owner == socket.id) {
                        this.drop_room(room)
                    }
                });
            })
            /**
             * When some leave a room
             */
            socket.on(EVENT_DISCONNECTING, function() {
                socket.rooms.forEach((name)=> {
                    if (name in service.rooms) {
                        var room = service.rooms[name]
                        if (room.owner != socket.id) {
                            service.io.to(room.owner).emit(USER_LEAVE_ROOM, {
                                user : socket.id
                            })
                        }
                    }
                })
            })
            /**
             * Join room
             */
            socket.on(JOIN_ROOM, (data) => {
                if(data.name == null || data.name.trim() == '' || !(data.name in this.rooms)) {
                    socket.emit(JOIN_ROOM, {
                        join: false
                    })
                } else {
                    socket.join(data.name)
                    socket.emit(JOIN_ROOM, {
                        join: true,
                        room: {
                            name : this.rooms[data.name].name,
                            owner_name: this.rooms[data.name].owner_name
                        }
                    })
                    this.rooms[data.name].socket.emit(EVENT_CALL, {
                        user : socket.id
                    })
                }
            })
            /**
             * Leave room
             */
            socket.on(LEAVE_ROOM, (data) => {
                if (data.name in this.rooms) {
                    socket.leave(data.name)

                    if (this.rooms[data.name].owner == socket.id) {
                        this.drop_room(data.name)
                    } else {
                        this.io.to(this.rooms[data.name].owner).emit(USER_LEAVE_ROOM, {
                            user : socket.id
                        })
                    }
                }
            })
            /**
             * Offer
             */
            socket.on(EVENT_OFFER, (data) => {
                this.io.to(data.user).emit(EVENT_OFFER, {
                    user: socket.id,
                    offer: data.offer
                })
            })
            /**
             * Awnser
             */
            socket.on(EVENT_ANSWER, (data) => {
                socket.to(data.user).emit(EVENT_ANSWER, {
                    user: socket.id,
                    answer: data.answer
                })
            })
            /**
             * Candidate
             */
            socket.on(EVENT_CANDIDATE, (data) => {
                socket.to(data.user).emit(EVENT_CANDIDATE, {
                    user: socket.id,
                    candidate: data.candidate
                })
            })
        })
    }
}

module.exports = (http) => {
    return new SocketService(http)
}