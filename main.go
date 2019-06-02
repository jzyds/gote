package main

import (
	"flag"
	"fmt"
	"github.com/jzyds/gote/app"
	"github.com/jzyds/gote/script"
)

func main() {
	portPtr := flag.String("port", "8000", "The port number for Dingo to listen to.")
	dbFilePathPtr := flag.String("database", "dingo.db", "The database file path for Djingo to use.")
	privKeyPathPtr := flag.String("priv-key", "dingo.rsa", "The private key file path for JWT.")
	pubKeyPathPtr := flag.String("pub-key", "dingo.rsa.pub", "The public key file path for JWT.")
	typePtr := flag.String("type", "serve", "Type of operation")
	migratePath := flag.String("migratePath", "empty", "The path of hexo source folder used to migrate.")

	flag.Parse()
	Gote.Init(*dbFilePathPtr, *privKeyPathPtr, *pubKeyPathPtr)

	if *typePtr == "serve" {
		Gote.Run(*portPtr)
	} else if *typePtr == "migration" {
		if *migratePath == "empty" {
			fmt.Println("Path of source folder for migrate can not be empty.")
		}else {
			script.Hexo(*migratePath)
		}
	} else {
		fmt.Println("Incorrect type.")
	}
}

// TODO: add pagination in admin post page
// TODO: gallery page add masonry
// https://github.com/desandro/masonry