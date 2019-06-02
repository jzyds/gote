package main

import (
	"flag"
	"fmt"
	"github.com/jzyds/gote/app"
	"github.com/jzyds/gote/script"
	"strconv"
)

func main() {
	portPtr := flag.String("port", "8000", "The port number for Dingo to listen to.")
	dbFilePathPtr := flag.String("database", "dingo.db", "The database file path for Djingo to use.")
	privKeyPathPtr := flag.String("priv-key", "dingo.rsa", "The private key file path for JWT.")
	pubKeyPathPtr := flag.String("pub-key", "dingo.rsa.pub", "The public key file path for JWT.")
	typePtr := flag.String("type", "serve", "Type of operation")
	migratePath := flag.String("migratePath", "empty", "The path of hexo source folder used to migrate.")
	imgResizeWidth := flag.String("imgResizeWidth", "200", "The width of resize image.")

	flag.Parse()
	Gote.Init(*dbFilePathPtr, *privKeyPathPtr, *pubKeyPathPtr)

	if *typePtr == "serve" {
		Gote.Run(*portPtr)
	} else if *typePtr == "migration" {
		if *migratePath == "empty" {
			fmt.Println("Path of source folder for migrate can not be empty.")
		} else {
			script.Hexo(*migratePath)
		}
	} else if *typePtr == "resizeUploadImage" {
		w, err := strconv.Atoi(*imgResizeWidth)
		if err != nil {
			fmt.Printf("i=%d, type: %T\n", w, w)
			return
		}
		script.ResizeUploadImg(w)
	} else {
		fmt.Println("Incorrect type.")
	}
}

// TODO: add pagination in admin post page
// https://github.com/desandro/masonry
