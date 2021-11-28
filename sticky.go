package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type Sticky struct {
	Id         int    `json:"id,omitempty"`
	Page       int    `json:"page,omitempty"`
	Color      string `json:"color,omitempty"`
	Shape      string `json:"shape,omitempty"`
	Locate_x   int    `json:"location_x,omitempty"`
	Locate_y   int    `json:"location_y,omitempty"`
	Text       string `json:"text,omitempty"`
	Empathy    int    `json:"empathy,omitempty"`
	Height     string `json:"height,omitempty"`
	UserCookie string `json:"user_cookie,omitempty"`
}

//付箋の情報をDBから取得しjson形式で表示
func getStickiesInfo(w http.ResponseWriter, r *http.Request) {
	rows, err := Db.Query("select * from lecture_" + TABLE_NAME)
	if err != nil {
		log.SetFlags(log.Lshortfile)
		log.Println("エラー:", err.Error())
	}

	var stickies []Sticky

	for rows.Next() {
		sticky := Sticky{}
		if er := rows.Scan(
			&sticky.Id,
			&sticky.Page,
			&sticky.Color,
			&sticky.Shape,
			&sticky.Locate_x,
			&sticky.Locate_y,
			&sticky.Text,
			&sticky.Empathy,
			&sticky.Height,
			&sticky.UserCookie,
		); er != nil {
			fmt.Println("エラー:", er)
		}
		stickies = append(stickies, sticky)
	}

	defer rows.Close()

	result, err := json.Marshal(stickies)
	if err != nil {
		fmt.Println("エラー:", err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(result)
}

func loadStickyId(w http.ResponseWriter, r *http.Request) {
	row, err := Db.Query("select ifnull(max(id),0) from lecture_" + TABLE_NAME)
	if err != nil {
		fmt.Println("エラー:", err.Error())
	}

	defer row.Close()

	var id int
	for row.Next() {
		if er := row.Scan(&id); er != nil {
			fmt.Println("エラー:", er)
		}
	}

	result, err := json.Marshal(id)
	if err != nil {
		fmt.Println("エラー:", err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(result)
}

func createSticky(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("user-id")
	if err != nil {
		fmt.Println("エラー: ", err)
	}

	var sticky Sticky
	len := r.ContentLength
	body := make([]byte, len)
	r.Body.Read(body)
	if err := json.Unmarshal(body[:len], &sticky); err != nil {
		fmt.Println("エラー")
	}

	sql, err := Db.Prepare("insert into lecture_" + TABLE_NAME + "(page, color, shape, location_x, location_y, text, empathy, height, user_cookie) values(?, ?, ?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		fmt.Println("エラー:", err)
	}
	sql.Exec(sticky.Page, sticky.Color, sticky.Shape, sticky.Locate_x, sticky.Locate_y, sticky.Text, sticky.Empathy, sticky.Height, cookie.Value)

	res, err := json.Marshal("{200, \"ok\"}")
	if err != nil {
		fmt.Println("エラー:", err)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}

func updateSticky(w http.ResponseWriter, r *http.Request) {
	var sticky Sticky
	len := r.ContentLength
	body := make([]byte, len)
	r.Body.Read(body)
	if err := json.Unmarshal(body[:len], &sticky); err != nil {
		fmt.Println("エラー:", err)
	}

	sql, err := Db.Prepare("update lecture_" + TABLE_NAME + " set location_x=?, location_y=? where id=?")
	if err != nil {
		fmt.Println("エラー:", err)
	}
	sql.Exec(sticky.Locate_x, sticky.Locate_y, sticky.Id)

	res, err := json.Marshal("{200, \"ok\"}")
	if err != nil {
		fmt.Println("エラー:", err)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}

func getEmpathyInfo(w http.ResponseWriter, r *http.Request) {
	row, err := Db.Query("select ifnull(max(id),0) from lecture_" + TABLE_NAME)
	if err != nil {
		fmt.Println("エラー:", err.Error())
	}
	var maxId int
	for row.Next() {
		row.Scan(&maxId)
	}

	cookie, err := r.Cookie("user-id")
	if err != nil {
		fmt.Println("エラー: ", err)
	}

	row, err = Db.Query("select sticky_id from empathy_info_"+TABLE_NAME+" where user_cookie=?", cookie.Value)
	if err != nil {
		fmt.Println("エラー:", err.Error())
	}
	defer row.Close()

	userEmpathy := make([]int, maxId+1)
	for row.Next() {
		var stickyId int
		err = row.Scan(&stickyId)
		if err != nil {
			fmt.Println("エラー", err)
		}
		userEmpathy[stickyId] = 1
	}

	result, err := json.Marshal(userEmpathy)
	if err != nil {
		fmt.Println("エラー:", err)
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
		fmt.Println("エラー:", err)
	}

	sql, err := Db.Prepare("update lecture_" + TABLE_NAME + " set empathy=empathy+1 where id=?")
	if err != nil {
		fmt.Println("エラー:", err)
	}
	sql.Exec(targetId.Id)

	cookie, err := r.Cookie("user-id")
	if err != nil {
		fmt.Println("エラー: ", err)
	}
	sql, err = Db.Prepare("insert into empathy_info_" + TABLE_NAME + "(sticky_id, user_cookie) values(?, ?)")
	if err != nil {
		fmt.Println("エラー:", err)
	}
	sql.Exec(targetId.Id, cookie.Value)

	res, err := json.Marshal("{200, \"ok\"}")
	if err != nil {
		fmt.Println("エラー:", err)
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
		fmt.Println("エラー:", err)
	}

	sql, err := Db.Prepare("update lecture_" + TABLE_NAME + " set empathy=empathy-1 where id=?")
	if err != nil {
		fmt.Println("エラー:", err)
	}
	sql.Exec(targetId.Id)

	cookie, err := r.Cookie("user-id")
	if err != nil {
		fmt.Println("エラー: ", err)
	}
	sql, err = Db.Prepare("delete from empathy_info_" + TABLE_NAME + " where sticky_id=? and user_cookie=?")
	if err != nil {
		fmt.Println("エラー:", err)
	}
	sql.Exec(targetId.Id, cookie.Value)

	res, err := json.Marshal("{200, \"ok\"}")
	if err != nil {
		fmt.Println("エラー:", err)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}

func removeSticky(w http.ResponseWriter, r *http.Request) {
	type TargetId struct {
		Id int `json:"id"`
	}
	var targetId TargetId
	len := r.ContentLength
	body := make([]byte, len)
	r.Body.Read(body)
	if err := json.Unmarshal(body[:len], &targetId); err != nil {
		fmt.Println("エラー:", err)
	}

	sql, err := Db.Prepare("delete from lecture_" + TABLE_NAME + " where id=?")
	if err != nil {
		fmt.Println("エラー:", err)
	}
	sql.Exec(targetId.Id)

	sql, err = Db.Prepare("delete from empathy_info_" + TABLE_NAME + " where sticky_id=?")
	if err != nil {
		fmt.Println("エラー:", err)
	}
	sql.Exec(targetId.Id)

	res, err := json.Marshal("{200, \"ok\"}")
	if err != nil {
		fmt.Println("エラー:", err)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}
