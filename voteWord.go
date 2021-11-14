package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type VotePageInfo struct {
	Text string `json:"text"`
}

func voteWord(w http.ResponseWriter, r *http.Request) {
	row, err := Db.Query("select max(id) from vote_word_info_" + TABLE_NAME)
	if err != nil {
		log.Println("エラー:", err.Error())
	}
	defer row.Close()

	var id sql.NullInt64
	for row.Next() {
		if er := row.Scan(&id); er != nil {
			log.Println("エラー:", er)
		}
	}

	type VoteWordInfo struct {
		Word string `json:"word"`
	}
	var voteWordInfo VoteWordInfo
	len := r.ContentLength
	body := make([]byte, len)
	r.Body.Read(body)
	if err := json.Unmarshal(body[:len], &voteWordInfo); err != nil {
		log.Println("エラー:", err)
	}

	sql, err := Db.Prepare("insert into vote_word_info_" + TABLE_NAME + "(word) values(?)")
	if err != nil {
		fmt.Println(err)
	}
	sql.Exec(voteWordInfo.Word)

	res, err := json.Marshal("{200, \"ok\"}")
	if err != nil {
		log.Println("エラー:", err)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}
