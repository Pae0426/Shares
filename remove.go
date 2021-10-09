package main

import (
	"encoding/json"
	"log"
	"net/http"
)

func removeSticky(w http.ResponseWriter, r *http.Request) {
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

	sql, err := Db.Prepare("delete from lecture4 where id=?")
	if err != nil {
		log.Println("エラー:", err)
	}
	sql.Exec(targetId.Id)

	sql, err = Db.Prepare("delete from empathy_info4 where sticky_id=?")
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
