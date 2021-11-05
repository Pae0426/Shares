package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type VoteInfo struct {
	VoteCount    []int `json:"voteCount"`
	UserVotePage []int `json:"userVotePage"`
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

	cookie, err := r.Cookie("user-id")
	if err != nil {
		log.Println("エラー: ", err)
	}

	row, err = Db.Query("select page from user_voted_page_"+TABLE_NAME+" where user_cookie=?", cookie.Value)
	if err != nil {
		log.Println("エラー:", err.Error())
	}
	defer row.Close()

	userVotePage := make([]int, maxPage+1)
	for row.Next() {
		var page int
		err = row.Scan(&page)
		if err != nil {
			log.Println("エラー", err)
		}
		userVotePage[page-1] = 1
	}

	voteInfo := VoteInfo{
		VoteCount:    voteCount,
		UserVotePage: userVotePage,
	}

	result, err := json.Marshal(voteInfo)
	if err != nil {
		log.Println("エラー:", err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(result)
}

func votePage(w http.ResponseWriter, r *http.Request) {
	type TargetPage struct {
		Page int `json:"page"`
	}
	var targetPage TargetPage
	len := r.ContentLength
	body := make([]byte, len)
	r.Body.Read(body)
	if err := json.Unmarshal(body[:len], &targetPage); err != nil {
		log.Println("エラー1:", err)
	}

	sql, err := Db.Prepare("update vote_page_info_" + TABLE_NAME + " set vote_num=vote_num+1 where page=?")
	if err != nil {
		log.Println("エラー2:", err)
	}
	sql.Exec(targetPage.Page)

	cookie, err := r.Cookie("user-id")
	if err != nil {
		log.Println("エラー3: ", err)
	}
	sql, err = Db.Prepare("insert into user_voted_page_" + TABLE_NAME + "(page, user_cookie) values(?, ?)")
	if err != nil {
		log.Println("エラー4:", err)
	}
	sql.Exec(targetPage.Page, cookie.Value)

	res, err := json.Marshal("{200, \"ok\"}")
	if err != nil {
		log.Println("エラー5:", err)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}

func removeVotePage(w http.ResponseWriter, r *http.Request) {
	type TargetPage struct {
		Page int `json:"page"`
	}
	var targetPage TargetPage
	len := r.ContentLength
	body := make([]byte, len)
	r.Body.Read(body)
	if err := json.Unmarshal(body[:len], &targetPage); err != nil {
		log.Println("エラー:", err)
	}

	sql, err := Db.Prepare("update vote_page_info_" + TABLE_NAME + " set vote_num=vote_num-1 where page=?")
	if err != nil {
		log.Println("エラー:", err)
	}
	sql.Exec(targetPage.Page)

	cookie, err := r.Cookie("user-id")
	if err != nil {
		log.Println("エラー: ", err)
	}
	sql, err = Db.Prepare("delete from user_voted_page_" + TABLE_NAME + " where page=? and user_cookie=?")
	if err != nil {
		log.Println("エラー:", err)
	}
	sql.Exec(targetPage.Page, cookie.Value)

	res, err := json.Marshal("{200, \"ok\"}")
	if err != nil {
		log.Println("エラー:", err)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}
