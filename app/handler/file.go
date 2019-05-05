package handler

import (
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"os"
	"path"
	"strconv"
	"strings"
	"time"

	"github.com/dinever/golf"
	"github.com/jzyds/gote/app/model"
	"github.com/jzyds/gote/app/utils"
)

func getRandomString(l int) string {
	str := "0123456789abcdefghijklmnopqrstuvwxyz"
	bytes := []byte(str)
	result := []byte{}
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	for i := 0; i < l; i++ {
		result = append(result, bytes[r.Intn(len(bytes))])
	}
	return string(result)
}

func FileGalleryStatusHandler(ctx *golf.Context) {
	//获取 Content-Type=application/x-www-form-urlencoded
	id := ctx.Request.PostFormValue("id")
	val := ctx.Request.PostFormValue("val")
	fileID, _ := strconv.Atoi(id)

	file := &model.FileDb{ID: int64(fileID)}
	err := file.GetFileByID()
	if err != nil {
		ctx.JSON(map[string]interface{}{
			"status": "error",
		})
		panic(err)
	}

	boolVal, _ := strconv.ParseBool(val)
	fmt.Println(val)
	file.IsShowOnGallery = boolVal
	file.Save()

	ctx.JSON(map[string]interface{}{
		"status": "success",
	})
}

func GalleryListHandle(ctx *golf.Context) {
	var files model.FileDbItem
	var err error

	pageList, ok := ctx.Request.URL.Query()["page"]
	if !ok || len(pageList) < 1 {
		log.Println("Url Param 'key' is missing")
		ctx.SendStatus(http.StatusBadRequest)
		ctx.JSON(APIResponseBodyJSON{Status: NewErrorStatusJSON(err.Error())})
		return
	}
	limit := 10
	page := pageList[0]

	intPage, _ := strconv.Atoi(page)
	if intPage < 1 {
		ctx.SendStatus(http.StatusBadRequest)
		ctx.JSON(APIResponseBodyJSON{Status: NewErrorStatusJSON(err.Error())})
		return
	}
	intPage = intPage - 1

	offset := intPage * limit
	files, err = model.GetGalleryList(offset, limit)
	if err != nil {
		ctx.SendStatus(http.StatusBadRequest)
		ctx.JSON(APIResponseBodyJSON{Status: NewErrorStatusJSON(err.Error())})
		return
	}
	ctx.JSONIndent(files, "", "  ")
}

func FileDbViewHandle(ctx *golf.Context) {
	userObj, _ := ctx.Session.Get("user")
	u := userObj.(*model.User)
	p := ctx.Request.FormValue("page")
	var page int
	if p == "" {
		page = 1
	} else {
		page, _ = strconv.Atoi(p)
	}

	fileItem := new(model.FileDbItem)

	pager, err := fileItem.GetFileDbItem(int64(page), 10, "created_at DESC")

	if err != nil {
		panic(err)
	}
	ctx.Loader("admin").Render("files.html", map[string]interface{}{
		"Title": "Files",
		"Files": fileItem,
		"User":  u,
		"Pager": pager,
	})
}

func FileRemoveHandler(ctx *golf.Context) {
	id := ctx.Request.FormValue("id")
	fileID, _ := strconv.Atoi(id)

	file := &model.FileDb{ID: int64(fileID)}
	err := file.GetFileByID()
	if err != nil {
		panic(err)
	}

	uploadDir, _ := ctx.App.Config.GetString("upload_dir", "upload")
	if model.CheckSafe(file.URL, uploadDir) {
		err := os.RemoveAll(file.URL)
		if err != nil {
			panic(err)
		}
	} else {
		ctx.Abort(403)
		return
	}

	err = model.DeleteFileByID(int64(fileID))

	if err != nil {
		panic(err)
	}

	ctx.JSON(map[string]interface{}{
		"status": "success",
	})
}

func FileUploadHandler(ctx *golf.Context) {
	req := ctx.Request
	req.ParseMultipartForm(32 << 20)
	f, h, e := req.FormFile("file")
	if e != nil {
		ctx.JSON(map[string]interface{}{
			"status": "error",
			"msg":    e.Error(),
		})
		return
	}
	data, _ := ioutil.ReadAll(f)
	maxSize, _ := ctx.App.Config.GetInt("app.upload_size", 1024*1024*10)
	defer func() {
		f.Close()
		data = nil
		h = nil
	}()
	if len(data) >= maxSize {
		ctx.JSON(map[string]interface{}{
			"status": "error",
			"msg":    "File size should be smaller than 10MB.",
		})
		return
	}
	fileExt, _ := ctx.App.Config.GetString("app.upload_files", ".jpg,.png,.gif,.zip,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx")
	if !strings.Contains(fileExt, path.Ext(h.Filename)) {
		ctx.JSON(map[string]interface{}{
			"status": "error",
			"msg":    "Only supports documents, images and zip files.",
		})
		return
	}

	saveFileName := getRandomString(10) + "_" + h.Filename
	fmt.Println(saveFileName)

	uploadDir, _ := ctx.App.Config.GetString("upload_dir", "upload")
	Url := model.CreateFilePath(uploadDir, saveFileName)
	e = ioutil.WriteFile(Url, data, os.ModePerm)
	if e != nil {
		ctx.JSON(map[string]interface{}{
			"status": "error",
			"msg":    e.Error(),
		})
		return
	}
	fi, err := os.Stat(Url)
	if err != nil {
		ctx.JSON(map[string]interface{}{
			"status": "error",
			"msg":    e.Error(),
		})
		return
	}

	fDb := model.NewFileDb()
	fDb.Name = saveFileName
	fDb.IsShowOnGallery = false
	fDb.URL = Url
	fDb.Save()

	fSize := utils.FileSize(fi.Size())
	fModTime := utils.DateFormat(fDb.CreatedAt, "%Y-%m-%d %H:%M")
	ctx.JSON(map[string]interface{}{
		"status": "success",
		"file": map[string]interface{}{
			"id":                 fDb.ID,
			"url":                Url,
			"name":               saveFileName,
			"size":               fSize,
			"type":               "File",
			"time":               fModTime,
			"is_show_on_gallery": fDb.IsShowOnGallery,
		},
	})
}
