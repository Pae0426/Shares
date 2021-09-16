package main

import (
	"github.com/gorilla/websocket"
)

type user struct {
	socket *websocket.Conn
	send   chan []byte
	room   *room
}

func (u *user) read() {
	for {
		if _, msg, err := u.socket.ReadMessage(); err == nil {
			u.room.forward <- msg
		} else {
			break
		}
	}
}
func (u *user) write() {
	for msg := range u.send {
		if err := u.socket.WriteMessage(websocket.TextMessage, msg); err != nil {
			break
		}
	}
}
