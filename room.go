package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type room struct {
	forward chan []byte
	join    chan *user
	leave   chan *user
	users   map[*user]bool
}

func newRoom() *room {
	return &room{
		forward: make(chan []byte),
		join:    make(chan *user),
		leave:   make(chan *user),
		users:   make(map[*user]bool),
	}
}

func (r *room) run() {
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

func (r *room) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	socket, err := upgrader.Upgrade(w, req, nil)
	if err != nil {
		log.Println("ServeHTTP:", err)
		return
	}
	user := &user{
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
	go user.write()
	user.read()
}
