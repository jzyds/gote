"use strict";

//gulp production is ran with 'type=production gulp'

var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  uglify = require('gulp-uglify'),
  sass = require('gulp-sass'),
  concat = require('gulp-concat'),
  cssmin = require('gulp-minify-css'),
  sourcemaps = require('gulp-sourcemaps'),
  livereload = require('gulp-livereload');

const through = require("through2");

const noop = function() {
  // just pass-through anything
  return through.obj();
};

gulp.task('html', function () {
  gulp.src('../*.html')
    .pipe(livereload());
});

gulp.task('css', function () {
  gulp.src('src/scss/**/*.scss')
    .pipe(process.env.type === 'production' ? noop() : sourcemaps.init())
    .pipe(sass())
    .pipe(process.env.type === 'production' ? noop() : sourcemaps.write())
    .pipe(process.env.type === 'production' ? cssmin() : noop())
    .pipe(gulp.dest('dist/css/'))
    .pipe(livereload());
});


gulp.task('js', function () {
  return gulp.src('./src/js/*.js')
    .pipe(process.env.type === 'production' ? noop() : sourcemaps.init())
    .pipe(concat('app.js'))
    .pipe(process.env.type === 'production' ? noop() : sourcemaps.write())
    .pipe(gulp.dest('dist/js'))
    .pipe(livereload());
});

gulp.task('vendor-js', function () {
  return gulp.src([
    'src/vendor/js/codemirror.js',
    'src/vendor/js/*.js'
  ])
    .pipe(concat('vendor.js'))
    .pipe(process.env.type === 'production' ? uglify() : noop())
    .pipe(gulp.dest('dist/js/'))
});

gulp.task('vendor-css', function () {
  return gulp.src('src/vendor/css/*.css')
    .pipe(concat('vendor.css'))
    .pipe(process.env.type === 'production' ? cssmin() : noop())
    .pipe(gulp.dest('dist/css/'))
});

gulp.task('copy-fonts', function () {
  return gulp.src('src/fonts/**/*').pipe(gulp.dest('dist/fonts/'));
});

gulp.task('copy-img', function () {
  return gulp.src('src/img/**/*.png').pipe(gulp.dest('dist/img/'));
});

//Watch task
gulp.task('watch', function () {
  livereload.listen();
  gulp.watch('./src/scss/**/*.scss', ['css']);
  gulp.watch('./src/js/*.js', ['js']);
  gulp.watch('./src/vendor/css/*.css', ['vendor-css']);
  gulp.watch('./src/vendor/js/*.js', ['vendor-js']);
  gulp.watch('./src/fonts/**/*', ['copy-fonts']);
  gulp.watch('./src/img/**/*.png', ['copy-img']);
  gulp.watch('../*.html', ['html']);
});

gulp.task('default', function () {
  gulp.start('html', 'copy-img', 'copy-fonts', 'vendor-js', 'vendor-css', 'js', 'css', 'watch')
});