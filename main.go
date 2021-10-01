package main

import (
	"database/sql"
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

func setDummyCookie(w http.ResponseWriter, r *http.Request) {
	dummyCookie := &http.Cookie{ //Cookieが空によるエラーを回避するためのCookie
		Name:  "dummyName1",
		Value: "dummyValue1",
	}
	http.SetCookie(w, dummyCookie)

	http.Redirect(w, r, "/home", 301)
}

func templateHandler(w http.ResponseWriter, r *http.Request) {
	row, e := Db.Query("select max(id) from user_cookie_info")
	if e != nil {
		log.Println("エラー:", e.Error())
	}

	defer row.Close()

	var lastId int
	for row.Next() {
		e = row.Scan(&lastId)
	}

	if e != nil {
		log.Println("エラー:", e.Error())
	}

	cookies := r.Cookies()
	lastCookie := "user" + strconv.Itoa(lastId)

	for i, c := range cookies {
		if c.Value == lastCookie {
			break
		}
		if i == len(cookies)-1 { //Cookie作成
			newCookie := "user" + strconv.Itoa(lastId+1)
			cookie := &http.Cookie{
				Name:  "user-id",
				Value: newCookie,
			}
			http.SetCookie(w, cookie)
			log.Println("Cookie設定完了")

			sql, err := Db.Prepare("insert into user_cookie_info(user_cookie) values(?)")
			if err != nil {
				log.Println("エラー:", err)
			}
			sql.Exec(newCookie)
		}
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
		log.Fatalln("テンプレートファイルを読み込めません:", err.Error())
	}
	if err := t.Execute(w, data); err != nil {
		log.Println("エラー:", err.Error())
	}
}

func main() {
	log.Println("Webサーバーを開始します...")
	r := NewRoom()
	http.Handle("/room", r)
	log.Println("r:")
	log.Println(r)
	go r.Run()
	server := http.Server{
		Addr: ":9000",
	}
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	http.HandleFunc("/home", templateHandler)
	http.HandleFunc("/", setDummyCookie)
	http.HandleFunc("/stickies", getStickiesInfo)
	http.HandleFunc("/load-sticky-id", loadStickyId)
	http.HandleFunc("/create-sticky", createSticky)
	http.HandleFunc("/update-sticky", updateSticky)
	http.HandleFunc("/get-empathy-info", getEmpathyInfo)
	http.HandleFunc("/increment-empathy", incrementEmpathy)
	http.HandleFunc("/decrement-empathy", decrementEmpathy)
	server.ListenAndServe()
}
