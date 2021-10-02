package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type Room struct {
	forward chan []byte
	join    chan *User
	leave   chan *User
	users   map[*User]bool
}

func NewRoom() *Room {
	return &Room{
		forward: make(chan []byte),
		join:    make(chan *User),
		leave:   make(chan *User),
		users:   make(map[*User]bool),
	}
}

func (r *Room) Run() {
	for {
		select {
		case user := <-r.join:
			r.users[user] = true
		case user := <-r.leave:
			delete(r.users, user)
			close(user.send)
		case msg := <-r.forward:
			for user := range r.users {
				select {
				case user.send <- msg:
				default:
					delete(r.users, user)
					close(user.send)
				}
			}
		}
	}
}

const (
	socketBufferSize  = 1024
	messageBufferSize = 256
)

var upgrader = &websocket.Upgrader{ReadBufferSize: socketBufferSize, WriteBufferSize: socketBufferSize}

func (r *Room) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	socket, err := upgrader.Upgrade(w, req, nil)
	if err != nil {
		log.Println("ServeHTTP:", err)
		return
	}
	user := &User{
		socket: socket,
		send:   make(chan []byte, messageBufferSize),
		room:   r,
	}
	r.join <- user
	log.Println("join")
	defer func() {
		r.leave <- user
		log.Println("leave")
	}()
	go user.Write()
	user.Read()
}
