package main

import (
	"html/template"
	"log"
	"net/http"
)

func templateHandler(w http.ResponseWriter, r *http.Request) {
	t, err := template.ParseFiles(
		"views/home.html",
		"views/header.html",
		"views/footer.html",
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
		Addr: "127.0.0.1:8080",
	}
	http.HandleFunc("/home", templateHandler)
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	server.ListenAndServe()
}
