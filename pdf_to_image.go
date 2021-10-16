package main

import (
	"fmt"
	"log"

	"gopkg.in/gographics/imagick.v3/imagick"
)

func Pdf_to_image() {
	// ImageMagic を初期化する。
	imagick.Initialize()
	defer imagick.Terminate()

	mw := imagick.NewMagickWand()
	defer mw.Destroy()

	// 解像度を設定する。
	err := mw.SetResolution(150, 150)
	if err != nil {
		log.Fatal("failed at SetResolution", err)
	}

	// 変換元のPDFを読み込む。
	err = mw.ReadImage("static/pdf/" + PDF_DIR + ".pdf")
	if err != nil {
		log.Fatal("failed at ReadImage", err)
	}

	// ページ数を取得する。
	n := mw.GetNumberImages()
	log.Println("number image: ", n)

	// 出力フォーマットをPNGに設定する。
	err = mw.SetImageFormat("jpeg")
	if err != nil {
		log.Fatal("failed at SetImageFormat")
	}

	// １ページずつ変換して出力する。
	for i := 0; i < int(n); i++ {
		// ページ番号を設定する。
		if ret := mw.SetIteratorIndex(i); !ret {
			break
		}

		// 画像を出力する。
		err = mw.WriteImage(fmt.Sprintf("static/pdf/"+PDF_DIR+"/%d.jpeg", i+1))
		if err != nil {
			log.Fatal("failed at WriteImage")
		}
	}
}
