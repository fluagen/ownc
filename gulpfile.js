var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');


gulp.task('font', function() {
    return gulp.src('resources/bower_components/bootstrap-sass/assets/fonts/bootstrap/*')
        .pipe(gulp.dest('public/assets/fonts/bootstrap'));
});

gulp.task('css', ['font'], function() {
    return gulp.src(['resources/sass/base.scss', 'resources/sass/main.scss'])
        .pipe(sass())
        .pipe(autoprefixer('last 10 version'))
        .pipe(gulp.dest('public/assets/css'));
});


gulp.task('build', ['css']);

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['build']);
