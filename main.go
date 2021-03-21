package main

import (
	//"fmt"
	"html/template"
	"log"
	"net/http"
	//"os"
)

func templateHandler(w http.ResponseWriter, r *http.Request) {
	t, err := template.ParseFiles("views/home.html")
	if err != nil {
		log.Fatalln("テンプレートファイルを読み込めません:", err.Error())
	}
	if err := t.Execute(w, nil); err != nil {
		log.Fatalln("エラー!:", err.Error())
	}
}

func main() {
	//dir, _ := os.Getwd()
	//log.Print(http.Dir(dir + "/static/"))
	log.Println("Webサーバーを開始します...")
	server := http.Server{
		Addr: "127.0.0.1:8080",
	}
	http.HandleFunc("/home", templateHandler)
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	server.ListenAndServe()
}
