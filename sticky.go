package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type Sticky struct {
	Id       int    `json:"id,omitempty"`
	Page     int    `json:"page,omitempty"`
	Color    string `json:"color,omitempty"`
	Shape    string `json:"shape,omitempty"`
	Locate_x int    `json:"location_x,omitempty"`
	Locate_y int    `json:"location_y,omitempty"`
	Text     string `json:"text,omitempty"`
	Empathy  int    `json:"empathy,omitempty"`
}

//付箋の情報をDBから取得しjson形式で表示
func getStickiesInfo(w http.ResponseWriter, r *http.Request) {
	rows, e := Db.Query("select * from lecture1")
	if e != nil {
		log.Println("エラー:", e.Error())
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
		); er != nil {
			log.Println(er)
		}
		stickies = append(stickies, sticky)
	}

	defer rows.Close()

	result, err := json.Marshal(stickies)
	if err != nil {
		log.Println("エラー:", err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(result)
}

func loadStickyId(w http.ResponseWriter, r *http.Request) {
	row, e := Db.Query("select max(id) from lecture1")
	if e != nil {
		log.Println("エラー:", e.Error())
	}

	defer row.Close()

	var id int
	for row.Next() {
		if er := row.Scan(&id); er != nil {
			log.Println(er)
		}
	}

	result, err := json.Marshal(id)
	if err != nil {
		log.Println("エラー:", err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(result)
}

func createSticky(w http.ResponseWriter, r *http.Request) {
	var sticky Sticky
	len := r.ContentLength
	body := make([]byte, len)
	r.Body.Read(body)
	if err := json.Unmarshal(body[:len], &sticky); err != nil {
		log.Fatalln("エラー")
	}

	sql, err := Db.Prepare("insert into lecture1(page, color, shape, location_x, location_y, text, empathy) values(?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		log.Println("エラー:", err)
	}
	sql.Exec(sticky.Page, sticky.Color, sticky.Shape, sticky.Locate_x, sticky.Locate_y, sticky.Text, sticky.Empathy)

	res, err := json.Marshal("{200, \"ok\"}")
	if err != nil {
		log.Println("エラー:", err)
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
		log.Println("エラー:", err)
	}

	sql, err := Db.Prepare("update lecture1 set location_x=?, location_y=? where id=?")
	if err != nil {
		log.Println("エラー:", err)
	}
	sql.Exec(sticky.Locate_x, sticky.Locate_y, sticky.Id)

	res, err := json.Marshal("{200, \"ok\"}")
	if err != nil {
		log.Println("エラー:", err)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}
