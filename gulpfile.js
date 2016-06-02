var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');


gulp.task('css', function(){
    return gulp.src('public/sass/*.scss')
        .pipe(sass())
        .pipe(autoprefixer('last 10 version'))
        .pipe(gulp.dest('public/stylesheets'));
});


gulp.task('build', ['css']);

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['build']);
