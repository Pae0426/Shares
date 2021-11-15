package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type VoteWordInfo struct {
	Id      int    `json:"id"`
	Word    string `json:"word"`
	Empathy int    `json:"empathy"`
}

func getVoteWordInfo(w http.ResponseWriter, r *http.Request) {
	row, err := Db.Query("select * from vote_word_info_" + TABLE_NAME)
	if err != nil {
		fmt.Println("エラー:", err)
	}

	var voteWords []VoteWordInfo
	for row.Next() {
		voteWord := VoteWordInfo{}
		err = row.Scan(
			&voteWord.Id,
			&voteWord.Word,
			&voteWord.Empathy,
		)
		if err != nil {
			fmt.Println("エラー:", err)
		}
		voteWords = append(voteWords, voteWord)
	}

	result, err := json.Marshal(voteWords)
	if err != nil {
		log.Println("エラー:", err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(result)
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

	type VoteWord struct {
		Word string `json:"word"`
	}
	var voteWord VoteWord
	len := r.ContentLength
	body := make([]byte, len)
	r.Body.Read(body)
	if err := json.Unmarshal(body[:len], &voteWord); err != nil {
		log.Println("エラー:", err)
	}

	sql, err := Db.Prepare("insert into vote_word_info_" + TABLE_NAME + "(word) values(?)")
	if err != nil {
		fmt.Println(err)
	}
	sql.Exec(voteWord.Word)

	res, err := json.Marshal("{200, \"ok\"}")
	if err != nil {
		log.Println("エラー:", err)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}
