package model

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

// A Row contains data that can be Scanned into a variable.
type Row interface {
	Scan(dest ...interface{}) error
}

// Initialize sets up the DB by creaing a new connection, creating tables if
// they don't exist yet, and creates the welcome data.
func Initialize(dbPath string, dbExists bool) error {
	if err := initConnection(dbPath); err != nil {
		return err
	}

	if err := createTableIfNotExist(); err != nil {
		return err
	}

	//SetNavigators([]string{"Home"}, []string{"/"})

	return nil
}

func initConnection(dbPath string) error {
	var err error
	db, err = sql.Open("sqlite3", dbPath)
	if err != nil {
		return err
	}
	return nil
}

func createTableIfNotExist() error {
	if _, err := db.Exec(schema); err != nil {
		return err
	}

	checkBlogSettings()
	return nil
}

func checkBlogSettings() {
	SetSettingIfNotExists("theme", "default", "blog")
	SetSettingIfNotExists("title", "My Blog", "blog")
	SetSettingIfNotExists("description", "Awesome blog created by Dingo.", "blog")
}
