package main

import (
	"html/template"
	"log"
	"net/http"
)

func templateHandler(w http.ResponseWriter, r *http.Request) {
	t, err := template.ParseFiles(
		"/app/home/views/home.html",
		"/app/home/views/header.html",
		"/app/home/views/footer.html",
	)
	if err != nil {
		log.Fatalln("テンプレートファイルを読み込めません:", err.Error())
	}
	if err := t.Execute(w, nil); err != nil {
		log.Fatalln("エラー!:", err.Error())
	}
}

func main() {
	log.Println("Webサーバーを開始します...")
	server := http.Server{
		Addr: ":8080",
	}
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("/app/home/static"))))
	http.HandleFunc("/home", templateHandler)
	server.ListenAndServe()
}
