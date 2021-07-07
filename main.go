package main

import (
	"database/sql"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

type Sticky struct {
	Id       int    `json:"id"`
	Page     int    `json:"page"`
	Color    string `json:"color"`
	Shape    string `json:"shape"`
	Locate_x int    `json:"x"`
	Locate_y int    `json:"y"`
	Text     string `json:"text"`
	Empathy  int    `json:"empathy"`
}

var Db *sql.DB

func init() {
	var err error
	err = godotenv.Load(fmt.Sprintf("./%s.env", os.Getenv("GO_ENV")))
	if err != nil {
		panic(err)
	}

	DB_NAME := os.Getenv("MYSQL_DATABASE")
	DB_USER := os.Getenv("MYSQL_USER")
	DB_PASS := os.Getenv("MYSQL_PASSWORD")
	DB_PROTOCOL := "tcp(shares-db:3306)"
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

func templateHandler(w http.ResponseWriter, r *http.Request) {
	data := map[string]int{
		"pages": countFiles(),
	}
	t, err := template.ParseFiles(
		"/go/src/app/views/home.html",
		"/go/src/app/views/header.html",
		"/go/src/app/views/footer.html",
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
		Addr: ":80",
	}
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("/go/src/app/static"))))
	http.HandleFunc("/home", templateHandler)
	server.ListenAndServe()
}
