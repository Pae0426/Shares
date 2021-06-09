package main

import (
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
)

func countFiles() int {
	files, _ := ioutil.ReadDir("./static/pdf/1/")
	var count int
	for _, f := range files {
		fmt.Println(f.Name())
		count++
	}
	fmt.Println(count)
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

func headerHandler(w http.ResponseWriter, r *http.Request) {
	h := r.Header
	fmt.Fprintln(w, h)
}

func main() {
	log.Println("Webサーバーを開始します...")
	server := http.Server{
		Addr: ":8080",
	}
	http.HandleFunc("/", headerHandler)
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("/go/src/app/static"))))
	http.HandleFunc("/home", templateHandler)
	server.ListenAndServe()
}
