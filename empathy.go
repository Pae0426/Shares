package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
)

func getEmpathyInfo(w http.ResponseWriter, r *http.Request) {
	row, e := Db.Query("select max(id) from lecture1")
	if e != nil {
		log.Println("エラー:", e.Error())
	}
	var maxId int
	for row.Next() {
		row.Scan(&maxId)
	}
	log.Println("maxId:" + strconv.Itoa(maxId))

	cookie, err := r.Cookie("user-id")
	if err != nil {
		log.Fatalln("エラー2: ", err)
	}

	row, e = Db.Query("select sticky_id from empathy_info where user_cookie=?", cookie.Value)
	if e != nil {
		log.Println("エラー3:", e.Error())
	}
	defer row.Close()

	//var empathySlice map[string][]int

	userEmpathy := make([]int, maxId)
	for row.Next() {
		var stickyId int
		e := row.Scan(&stickyId)
		if e != nil {
			log.Println("エラー4", e)
		}
		log.Println("stickyId:" + strconv.Itoa(stickyId))
		userEmpathy[stickyId] = 1
	}

	result, err := json.Marshal(userEmpathy)
	if err != nil {
		log.Println("エラー5:", err)
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
		log.Println("エラー6:", err)
	}

	sql, err := Db.Prepare("update lecture1 set empathy=empathy+1 where id=?")
	if err != nil {
		log.Println("エラー7:", err)
	}
	sql.Exec(targetId.Id)

	cookie, err := r.Cookie("user-id")
	if err != nil {
		log.Println("エラー8: ", err)
	}
	sql, err = Db.Prepare("insert into empathy_info(sticky_id, user_cookie) values(?, ?)")
	if err != nil {
		log.Println("エラー9:", err)
	}
	sql.Exec(targetId.Id, cookie.Value)

	res, err := json.Marshal("{200, \"ok\"}")
	if err != nil {
		log.Println("エラー10:", err)
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
		log.Println("エラー11:", err)
	}

	sql, err := Db.Prepare("update lecture1 set empathy=empathy-1 where id=?")
	if err != nil {
		log.Println("エラー12:", err)
	}
	sql.Exec(targetId.Id)

	res, err := json.Marshal("{200, \"ok\"}")
	if err != nil {
		log.Println("エラー13:", err)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}
