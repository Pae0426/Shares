package main

import (
	"html/template"
	"log"
	"net/http"
)

func templateHandler(w http.ResponseWriter, r *http.Request) {
	t, err := template.ParseFiles(
		"/go/src/app/views/home.html",
		"/go/src/app/views/header.html",
		"/go/src/app/views/footer.html",
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
		Addr: ":80",
	}
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("/go/src/app/static"))))
	http.HandleFunc("/home", templateHandler)
	server.ListenAndServe()
}
