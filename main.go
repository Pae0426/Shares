package main

import (
	"database/sql"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"

	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

var Db *sql.DB

const TABLE_NAME = "14"
const PDF_DIR = "14"

func init() {
	var err error
	err = godotenv.Load(".env")
	if err != nil {
		log.Println("エラー:", err)
	}

	DB_NAME := os.Getenv("MYSQL_DATABASE")
	DB_USER := os.Getenv("MYSQL_USER")
	DB_PASS := os.Getenv("MYSQL_PASSWORD")
	DB_PROTOCOL := "tcp(127.0.0.1:3306)"
	DB_CONNECT_INFO := DB_USER + ":" + DB_PASS + "@" + DB_PROTOCOL + "/" + DB_NAME
	Db, err = sql.Open("mysql", DB_CONNECT_INFO)
	if err != nil {
		log.Println("エラー:", err)
	}
}

//指定ディレクトリ下のファイル数をカウントする
func countFiles() int {
	files, _ := ioutil.ReadDir("./static/pdf/" + PDF_DIR + "/")
	var count int
	for _, f := range files {
		if f.Name() == ".DS_Store" {
			continue
		}
		count++
	}
	return count
}

func setTotalPage(w http.ResponseWriter, r *http.Request) {
	total_page := countFiles()
	for page := 1; page <= total_page; page++ {
		sql, err := Db.Prepare("insert into vote_page_info_" + TABLE_NAME + "(page) values(?)")
		if err != nil {
			log.Println("エラー:", err)
		}
		sql.Exec(page)
	}
}

func templateHandler(w http.ResponseWriter, r *http.Request) {
	row, err := Db.Query("select ifnull(max(id),0) from user_cookie_info_" + TABLE_NAME)
	if err != nil {
		log.Println("エラー:", err.Error())
	}

	defer row.Close()

	var lastId int
	for row.Next() {
		err = row.Scan(&lastId)
	}

	if err != nil {
		log.Println("エラー:", err.Error())
	}

	_, err = r.Cookie("user-id")
	if err == http.ErrNoCookie {
		newCookie := "user" + strconv.Itoa(lastId+1)
		cookie := &http.Cookie{
			Name:   "user-id",
			Value:  newCookie,
			MaxAge: 60 * 60 * 3,
		}
		http.SetCookie(w, cookie)
		log.Println("Cookie設定完了")

		sql, err := Db.Prepare("insert into user_cookie_info_" + TABLE_NAME + "(user_cookie) values(?)")
		if err != nil {
			log.Println("エラー:", err)
		}
		sql.Exec(newCookie)
	}

	data := map[string]int{
		"pages": countFiles(),
	}
	t, err := template.ParseFiles(
		"views/home.html",
		"views/header.html",
		"views/footer.html",
	)
	if err != nil {
		fmt.Println("テンプレートファイルを読み込めません:", err.Error())
	}
	if err := t.Execute(w, data); err != nil {
		fmt.Println("エラー:", err.Error())
	}
}

func Pdf(w http.ResponseWriter, r *http.Request) {
	Pdf_to_image()
}

func main() {
	log.Println("Webサーバーを開始します...")
	server := http.Server{
		Addr: ":9000",
	}
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	http.HandleFunc("/", templateHandler)
	http.HandleFunc("/stickies", getStickiesInfo)
	http.HandleFunc("/load-sticky-id", loadStickyId)
	http.HandleFunc("/create-sticky", createSticky)
	http.HandleFunc("/update-sticky", updateSticky)
	http.HandleFunc("/get-empathy-info", getEmpathyInfo)
	http.HandleFunc("/increment-empathy", incrementEmpathy)
	http.HandleFunc("/decrement-empathy", decrementEmpathy)
	http.HandleFunc("/remove-sticky", removeSticky)
	http.HandleFunc("/get-highlight-info", getHighlightInfo)
	http.HandleFunc("/add-highlight", addHighlight)
	http.HandleFunc("/update-highlight", updateHighlight)
	http.HandleFunc("/remove-highlight", removeHighlight)
	http.HandleFunc("/set-total-page", setTotalPage)
	http.HandleFunc("/get-vote-page-info", getVotePageInfo)
	http.HandleFunc("/vote-page", votePage)
	http.HandleFunc("/remove-vote-page", removeVotePage)
	http.HandleFunc("/pdf", Pdf)
	server.ListenAndServe()
}
