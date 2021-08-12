package main

import (
	"database/sql"
	"encoding/json"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

type Sticky struct {
	Id       int    `json:"id,omitempty"`
	Page     int    `json:"page"`
	Color    string `json:"color"`
	Shape    string `json:"shape"`
	Locate_x int    `json:"location_x"`
	Locate_y int    `json:"location_y"`
	Text     string `json:"text"`
	Empathy  int    `json:"empathy"`
}

var Db *sql.DB

func init() {
	var err error
	err = godotenv.Load(".env")
	if err != nil {
		panic(err)
	}

	DB_NAME := os.Getenv("MYSQL_DATABASE")
	DB_USER := os.Getenv("MYSQL_USER")
	DB_PASS := os.Getenv("MYSQL_PASSWORD")
	DB_PROTOCOL := "tcp(127.0.0.1:3306)"
	DB_CONNECT_INFO := DB_USER + ":" + DB_PASS + "@" + DB_PROTOCOL + "/" + DB_NAME
	Db, err = sql.Open("mysql", DB_CONNECT_INFO)
	if err != nil {
		panic(err)
	}
}

//指定ディレクトリ下のファイル数をカウントする
func countFiles() int {
	files, _ := ioutil.ReadDir("./static/pdf/1/")
	var count int
	for _, f := range files {
		if f.Name() == ".DS_Store" {
			continue
		}
		count++
	}
	return count
}

//付箋の情報をDBから取得しjson形式で表示
func getStickiesInfo(w http.ResponseWriter, r *http.Request) {
	rows, e := Db.Query("select * from lecture1")
	if e != nil {
		log.Println(e.Error())
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
		panic(err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(result)
}

func loadStickyId(w http.ResponseWriter, r *http.Request) {
	row, e := Db.Query("select max(id) from lecture1")
	if e != nil {
		log.Println(e.Error())
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
		panic(err)
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
		panic(err)
	}
	sql.Exec(sticky.Page, sticky.Color, sticky.Shape, sticky.Locate_x, sticky.Locate_y, sticky.Text, sticky.Empathy)
}

func templateHandler(w http.ResponseWriter, r *http.Request) {
	data := map[string]int{
		"pages": countFiles(),
	}
	t, err := template.ParseFiles(
		"views/home.html",
		"views/header.html",
		"views/footer.html",
	)
	if err != nil {
		log.Fatalln("テンプレートファイルを読み込めません:", err.Error())
	}
	if err := t.Execute(w, data); err != nil {
		log.Fatalln("エラー!:", err.Error())
	}
}

func main() {
	log.Println("Webサーバーを開始します...")
	server := http.Server{
		Addr: ":9000",
	}
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	http.HandleFunc("/home", templateHandler)
	http.HandleFunc("/stickies", getStickiesInfo)
	http.HandleFunc("/load-sticky-id", loadStickyId)
	http.HandleFunc("/create-sticky", createSticky)
	server.ListenAndServe()
}
