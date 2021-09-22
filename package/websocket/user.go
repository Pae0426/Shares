package websocket

import (
	"github.com/gorilla/websocket"
)

type User struct {
	socket *websocket.Conn
	send   chan []byte
	room   *Room
}

func (u *User) Read() {
	for {
		if _, msg, err := u.socket.ReadMessage(); err == nil {
			u.room.forward <- msg
		} else {
			break
		}
	}
}
func (u *User) Write() {
	for msg := range u.send {
		if err := u.socket.WriteMessage(websocket.TextMessage, msg); err != nil {
			break
		}
	}
}
