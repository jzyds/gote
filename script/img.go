package script

import (
	"fmt"
	"github.com/disintegration/imaging"
	"io/ioutil"
	"log"
	"path/filepath"
	"strings"
)

func resize(path string, w int)  {
	fmt.Println(path)
	src, err := imaging.Open(path)
	if err != nil {
		log.Fatalf("failed to open image: %v", err)
	}
	src = imaging.Resize(src, w, 0, imaging.Lanczos)
	// Save the resulting image as JPEG.
	err = imaging.Save(src, path)
	if err != nil {
		log.Fatalf("failed to save image: %v", err)
	}
}

func listFile(w int)  {
	dir := "upload"
	files, err := ioutil.ReadDir(dir)
	if err != nil {
		log.Fatal(err)
	}
	for _, file := range files {
		var p string
		fN := file.Name()
		if file.IsDir() {
			continue
		}

		// cross platform file paths
		dir = filepath.FromSlash(dir)

		if strings.HasSuffix(dir, "/") || strings.HasSuffix(dir, "\\") {
			p = dir + fN
		} else {
			p = dir + "/" + fN
		}
		resize(p, w)
	}
}

func ResizeUploadImg(w int)  {
	listFile(w)
}