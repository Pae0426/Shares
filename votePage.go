package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type VotePage struct {
	Id      int `json:"id,omitempty"`
	Page    int `json:"page,omitempty"`
	VoteNum int `json:""`
}

func getVotePageInfo(w http.ResponseWriter, r *http.Request) {
	row, err := Db.Query("select max(id) from vote_page_info_" + TABLE_NAME)
	if err != nil {
		log.Println("エラー:", err.Error())
	}
	var maxPage int
	for row.Next() {
		row.Scan(&maxPage)
	}
	log.Println("maxPage:")
	log.Println(maxPage)

	row, err = Db.Query("select vote_num from vote_page_info_" + TABLE_NAME)
	if err != nil {
		log.Println("エラー:", err.Error())
	}
	defer row.Close()

	var voteCount []int
	for row.Next() {
		var count int
		err = row.Scan(&count)
		if err != nil {
			log.Println("エラー", err)
		}
		voteCount = append(voteCount, count)
	}

	result, err := json.Marshal(voteCount)
	if err != nil {
		log.Println("エラー:", err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(result)
}
