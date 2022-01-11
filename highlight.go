package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

type HighlightInfo struct {
	SumWidth   []int       `json:"sumWidth"`
	Highlights []Highlight `json:"highlights"`
}

type Highlight struct {
	Id          int    `json:"id, omitempty"`
	Width       int    `json:"width, omitempty"`
	Page        int    `json:"page, omitempty"`
	X           int    `json:"x, omitempty"`
	Y           int    `json:"y, omitempty"`
	UserCookie  string `json:"user_cookie,omitempty"`
	WinWidth    int    `json:"win_width,omitempty"`
	SlideHeight int    `json:"slide_height,omitempty"`
	SlideWidth  int    `json:"slide_width,omitempty"`
}

func getHighlightInfo(w http.ResponseWriter, r *http.Request) {
	row, err := Db.Query("select ifnull(max(id),0) from highlight_info_" + TABLE_NAME)
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

	total_page := countFiles()
	var sum_width_page int
	var sum_width_all []int
	for page := 1; page <= total_page; page++ {
		row, err = Db.Query("select ifnull(sum(width),0) as sum_page from highlight_info_" + TABLE_NAME + " where page=" + strconv.Itoa(page))

		for row.Next() {
			if er := row.Scan(&sum_width_page); er != nil {
				fmt.Println("エラー:", er)
			}
		}
		sum_width_all = append(sum_width_all, sum_width_page)
	}

	row, err = Db.Query("select * from highlight_info_" + TABLE_NAME + " order by page")
	if err != nil {
		fmt.Println("エラー:", err.Error())
	}

	var highlights []Highlight
	for row.Next() {
		highlight := Highlight{}
		if er := row.Scan(
			&highlight.Id,
			&highlight.Width,
			&highlight.Page,
			&highlight.X,
			&highlight.Y,
			&highlight.UserCookie,
			&highlight.WinWidth,
			&highlight.SlideHeight,
			&highlight.SlideWidth,
		); er != nil {
			fmt.Println("エラー:", er)
		}
		highlights = append(highlights, highlight)
	}

	highlightInfo := HighlightInfo{
		SumWidth:   sum_width_all,
		Highlights: highlights,
	}

	result, err := json.Marshal(highlightInfo)
	if err != nil {
		fmt.Println("エラー:", err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(result)
}

func getHighlightId() int {
	row, err := Db.Query("select ifnull(max(id),0) from highlight_info_" + TABLE_NAME)
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

	return id
}

func addHighlight(w http.ResponseWriter, r *http.Request) {
	var highlight Highlight
	len := r.ContentLength
	body := make([]byte, len)
	r.Body.Read(body)
	if err := json.Unmarshal(body[:len], &highlight); err != nil {
		fmt.Println("エラー:", err)
	}

	cookie, err := r.Cookie("user-id")
	if err != nil {
		fmt.Println("エラー: ", err)
	}
	sql, err := Db.Prepare("insert into highlight_info_" + TABLE_NAME + "(width, page, x, y, user_cookie, win_width, slide_height, slide_width) values(?, ?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		fmt.Println("エラー:", err)
	}
	sql.Exec(highlight.Width, highlight.Page, highlight.X, highlight.Y, cookie.Value, highlight.WinWidth, highlight.SlideHeight, highlight.SlideWidth)

	id := getHighlightId()
	res, err := json.Marshal(id)
	if err != nil {
		fmt.Println("エラー:", err)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}

func updateHighlight(w http.ResponseWriter, r *http.Request) {
	var highlight Highlight
	len := r.ContentLength
	body := make([]byte, len)
	r.Body.Read(body)
	if err := json.Unmarshal(body[:len], &highlight); err != nil {
		fmt.Println("エラー:", err)
	}

	if highlight.Width != 0 {
		sql, err := Db.Prepare("update highlight_info_" + TABLE_NAME + " set width=? where id=?")
		if err != nil {
			fmt.Println("エラー:", err)
		}
		sql.Exec(highlight.Width, highlight.Id)
	}

	res, err := json.Marshal("{200, \"ok\"}")
	if err != nil {
		fmt.Println("エラー:", err)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}

func removeHighlight(w http.ResponseWriter, r *http.Request) {
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

	cookie, err := r.Cookie("user-id")
	if err != nil {
		fmt.Println("エラー: ", err)
	}

	row, err := Db.Query("select user_cookie from highlight_info_" + TABLE_NAME + " where id=" + strconv.Itoa(targetId.Id))
	if err != nil {
		fmt.Println("エラー:", err)
	}

	defer row.Close()

	var highlight_cookie string
	for row.Next() {
		if er := row.Scan(&highlight_cookie); er != nil {
			fmt.Println("エラー:", er)
		}
	}

	var result string
	if cookie.Value == highlight_cookie {
		sql, err := Db.Prepare("delete from highlight_info_" + TABLE_NAME + " where id=?")
		if err != nil {
			fmt.Println("エラー:", err)
		}
		sql.Exec(targetId.Id)

		result = "deleted"
	} else {
		result = "returned"
	}

	res, err := json.Marshal(result)
	if err != nil {
		fmt.Println("エラー:", err)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}
