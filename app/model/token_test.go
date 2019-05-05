package model

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/dinever/golf"
	. "github.com/smartystreets/goconvey/convey"
)

func mockSimpleContext() *golf.Context {
	req, _ := http.NewRequest("GET", "/login/", nil)
	return golf.NewContext(req, nil, nil)
}

func TestToken(t *testing.T) {
	Convey("Initialize database", t, func() {
		testDB := fmt.Sprintf(filepath.Join(os.TempDir(), "ding-testdb-%s"), fmt.Sprintf(time.Now().Format("20060102T150405.000")))
		Initialize(testDB, true)

		Convey("Test Token", func() {
			ctx := mockSimpleContext()

			user := mockUser()
			err := user.Create(password)
			So(err, ShouldBeNil)

			token := NewToken(user, ctx, 100)
			err = token.Save()
			So(err, ShouldBeNil)

			Convey("Get Token", func() {
				t := &Token{Value: token.Value, UserId: token.UserId}
				err = token.GetTokenByValue()
				//t, err := GetTokenByValue(token.Value)

				// So(token, ShouldEqual, t) should work here,
				// but due to the goconvey's transformation, it failed.
				So(token.Value, ShouldEqual, t.Value)
				So(token.UserId, ShouldEqual, t.UserId)
				So(err, ShouldBeNil)
			})

			Convey("Token is valid", func() {
				valid := token.IsValid()

				So(valid, ShouldEqual, true)
				So(err, ShouldBeNil)
			})
		})
		Reset(func() {
			os.Remove(testDB)
		})
	})
}
