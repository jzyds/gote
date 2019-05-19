package script

import (
	"fmt"
	"github.com/jzyds/gote/app/model"
	"github.com/jzyds/gote/app/utils"
	"io/ioutil"
	"log"
	"math/rand"
	"path/filepath"
	"strings"
	"time"
)

var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

func randSeq(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

func saveData(str string)  {
	s := strings.Split(str, "---")
	inf := s[1]
	con := s[2]
	tagStr := ""
	title := ""
	infLines := strings.Split(inf, "\n")

	for _, line := range infLines {
		if strings.Contains(line, "title:") {
			title = strings.Split(line, "title: ")[1]
		}

		if strings.Contains(line, " - ") {
			t := strings.Split(line, " - ")[1]
			if tagStr == "" {
				tagStr = tagStr + t
			}else {
				tagStr = tagStr + ", " + t
			}
		}
	}

	p := model.NewPost()
	p.Title = title
	p.Slug = randSeq(10)
	p.Markdown = con
	p.Html = utils.Markdown2Html(p.Markdown)
	p.AllowComment = false
	p.Category = ""
	p.CreatedBy = 0
	p.UpdatedBy = 0
	p.IsPublished = true
	p.IsPage = false
	pTags := model.GenerateTagsFromCommaString(tagStr)
	err := p.Save(pTags...)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println("migration success")
}

func fileContent(f string) {
	fmt.Println(f)
	rand.Seed(time.Now().UnixNano())
	b, err := ioutil.ReadFile(f)
	if err != nil {
		fmt.Print(err)
	}
	str := string(b) // convert content to a 'string'
	saveData(str)
}

func searchFiles(dir string) { // dir is the parent directory you what to search
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

		if !strings.HasSuffix(fN, ".md") {
			continue
		}

		// cross platform file paths
		dir = filepath.FromSlash(dir)

		if strings.HasSuffix(dir, "/") || strings.HasSuffix(dir, "\\") {
			p = dir + fN
		} else {
			p = dir + "/" + fN
		}

		fileContent(p)
	}
}

func Hexo(path string) {
	searchFiles(path)
}
