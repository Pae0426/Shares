package main

import (
	"encoding/json"
	"log"
	"net/http"
)

func incrementEmpathy(w http.ResponseWriter, r *http.Request) {
	type TargetId struct {
		Id int `json:"id"`
	}
	var targetId TargetId
	len := r.ContentLength
	body := make([]byte, len)
	r.Body.Read(body)
	if err := json.Unmarshal(body[:len], &targetId); err != nil {
		log.Println("エラー1:", err)
	}

	sql, err := Db.Prepare("update lecture1 set empathy=empathy+1 where id=?")
	if err != nil {
		log.Println("エラー2:", err)
	}
	sql.Exec(targetId.Id)

	cookie, err := r.Cookie("user-id")
	if err != nil {
		log.Println("エラー3: ", err)
	}
	sql, err = Db.Prepare("insert into empathy_info(sticky_id, user_cookie) values(?, ?)")
	if err != nil {
		log.Println("エラー4:", err)
	}
	sql.Exec(targetId.Id, cookie.Value)

	res, err := json.Marshal("{200, \"ok\"}")
	if err != nil {
		log.Println("エラー5:", err)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}

func decrementEmpathy(w http.ResponseWriter, r *http.Request) {
	type TargetId struct {
		Id int `json:"id"`
	}
	var targetId TargetId
	len := r.ContentLength
	body := make([]byte, len)
	r.Body.Read(body)
	if err := json.Unmarshal(body[:len], &targetId); err != nil {
		log.Println("エラー:", err)
	}

	sql, err := Db.Prepare("update lecture1 set empathy=empathy-1 where id=?")
	if err != nil {
		log.Println("エラー:", err)
	}
	sql.Exec(targetId.Id)

	res, err := json.Marshal("{200, \"ok\"}")
	if err != nil {
		log.Println("エラー:", err)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}
