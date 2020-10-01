var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var pipeline = require('readable-stream').pipeline;
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var imagemin = require('gulp-imagemin');
var spritesmith = require('gulp.spritesmith');
var svgSymbols = require('gulp-svg-symbols')

//sass to css
sass.compiler = require('node-sass');
gulp.task('sass', function () {
  return gulp.src('./app/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./app/css'))
    .pipe(browserSync.stream());
});

//compress assets(pictures)
gulp.task('compress_assets',() => {
  return gulp.src('./app/assets/*')
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]))
    .pipe(imagemin())
    .pipe(gulp.dest('./app/assets/optimized'));
});

//compress images
gulp.task('compress-images',() => {
  return gulp.src('./app/images/*')
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]))
    .pipe(imagemin())
    .pipe(gulp.dest('./app/images/optimized'));
});

//image sprite
gulp.task('image_sprite', function () {
  var spriteData = gulp.src('./app/images/optimized/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.css'
  }));
  return spriteData.pipe(gulp.dest('./app/img-sprite'));
});

//svg sprite
gulp.task(`svg_sprite`, function() {
  return gulp
    .src(`./app/svg/*.svg`)
    .pipe(svgSymbols())
    .pipe(gulp.dest(`./app/svg-sprite`))
})

//minify js
gulp.task('minify-js', function () {
  return pipeline(
        gulp.src('./app/js/*.js'),
        uglify(),
        rename(function (path) {
          // Updates the object in-place
          // path.dirname += "/ciao";
          path.basename += "";
          path.extname = ".js";
        }),
        gulp.dest('./app/build/js')
  );
});

//minify css
gulp.task('minify-css',() => {
  return gulp.src('./app/css/*.css')
    // .pipe(sourcemaps.init())
    .pipe(cleanCSS())
    // .pipe(sourcemaps.write())
    .pipe(rename(function (path) {
      // Updates the object in-place
      // path.dirname += "/ciao";
      path.basename += "";
      path.extname = ".css";
    }))
    .pipe(gulp.dest('./app/build/css'));
});

//move fonts to build folder
gulp.task('fonts', function() {
  return gulp.src('./app/fonts/**/*')
  .pipe(gulp.dest('./app/build/fonts'))
})

//move assets to build folder
gulp.task('move_assets', function() {
  return gulp.src('./app/assets/optimized/*')
  .pipe(gulp.dest('./app/build/assets'))
})

//move sprite images to build folder
gulp.task('move_image_sprite', function() {
  return gulp.src('./app/img-sprite/*')
  .pipe(gulp.dest('./app/build/img-sprite'))
})

//move sprite images to build folder
gulp.task('move_svg_sprite', function() {
  return gulp.src('./app/svg-sprite/*')
  .pipe(gulp.dest('./app/build/svg-sprite'))
})

//move html to build folder
gulp.task('move_htmls', function() {
  return gulp.src('./app/*.html')
  .pipe(gulp.dest('./app/build'))
})

//watch css js and htmls
gulp.task('watch', function(){
  browserSync.init({
    server: "./app"
  });
  gulp.watch("./app/*.html").on("change", browserSync.reload);
  gulp.watch("./app/js/*.js").on("change", browserSync.reload);
  gulp.watch('./app/scss/*.scss', gulp.series('sass'));
  
});

//execute requirement tasks
gulp.task('default', gulp.series(
  'sass',
  'compress_assets',
  'compress-images',
  'image_sprite',
  'svg_sprite',
  'watch'
))

//build everything
gulp.task('build', gulp.series(
  'sass',
  'compress_assets',
  'compress-images',
  'image_sprite',
  'svg_sprite',
  'minify-js',
  'minify-css',
  'move_assets',
  'move_image_sprite',
  'move_htmls',
  'move_svg_sprite',
  'fonts'
))



