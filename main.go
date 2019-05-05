package main

import (
	"flag"

	"github.com/jzyds/gote/app"
)

func main() {
	portPtr := flag.String("port", "8000", "The port number for Dingo to listen to.")
	dbFilePathPtr := flag.String("database", "dingo.db", "The database file path for Djingo to use.")
	privKeyPathPtr := flag.String("priv-key", "dingo.rsa", "The private key file path for JWT.")
	pubKeyPathPtr := flag.String("pub-key", "dingo.rsa.pub", "The public key file path for JWT.")
	flag.Parse()

	Dingo.Init(*dbFilePathPtr, *privKeyPathPtr, *pubKeyPathPtr)
	Dingo.Run(*portPtr)
}
