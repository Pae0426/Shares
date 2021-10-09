package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
)

func getEmpathyInfo(w http.ResponseWriter, r *http.Request) {
	row, err := Db.Query("select max(id) from lecture4")
	if err != nil {
		log.Println("エラー:", err.Error())
	}
	var maxId int
	for row.Next() {
		row.Scan(&maxId)
	}
	log.Println("maxId:" + strconv.Itoa(maxId))

	cookie, err := r.Cookie("user-id")
	if err != nil {
		log.Fatalln("エラー: ", err)
	}

	row, err = Db.Query("select sticky_id from empathy_info4 where user_cookie=?", cookie.Value)
	if err != nil {
		log.Println("エラー:", err.Error())
	}
	defer row.Close()

	//var empathySlice map[string][]int

	userEmpathy := make([]int, maxId+1)
	for row.Next() {
		var stickyId int
		err = row.Scan(&stickyId)
		if err != nil {
			log.Println("エラー", err)
		}
		log.Println("stickyId:" + strconv.Itoa(stickyId))
		userEmpathy[stickyId] = 1
	}

	result, err := json.Marshal(userEmpathy)
	if err != nil {
		log.Println("エラー:", err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(result)
}

func incrementEmpathy(w http.ResponseWriter, r *http.Request) {
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

	sql, err := Db.Prepare("update lecture4 set empathy=empathy+1 where id=?")
	if err != nil {
		log.Println("エラー:", err)
	}
	sql.Exec(targetId.Id)

	cookie, err := r.Cookie("user-id")
	if err != nil {
		log.Println("エラー: ", err)
	}
	sql, err = Db.Prepare("insert into empathy_info4(sticky_id, user_cookie) values(?, ?)")
	if err != nil {
		log.Println("エラー:", err)
	}
	sql.Exec(targetId.Id, cookie.Value)

	res, err := json.Marshal("{200, \"ok\"}")
	if err != nil {
		log.Println("エラー:", err)
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

	sql, err := Db.Prepare("update lecture4 set empathy=empathy-1 where id=?")
	if err != nil {
		log.Println("エラー:", err)
	}
	sql.Exec(targetId.Id)

	cookie, err := r.Cookie("user-id")
	if err != nil {
		log.Println("エラー: ", err)
	}
	sql, err = Db.Prepare("delete from empathy_info4 where sticky_id=? and user_cookie=?")
	if err != nil {
		log.Println("エラー:", err)
	}
	sql.Exec(targetId.Id, cookie.Value)

	res, err := json.Marshal("{200, \"ok\"}")
	if err != nil {
		log.Println("エラー:", err)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}
