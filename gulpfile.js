var gulp = require('gulp');

var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');

gulp.task('sass', function(){
    gulp.src('sass/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
			browsers: ['>1%']
		}))
        .pipe(gulp.dest('.'))
})

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var stringify = require('stringify');

gulp.task('browserify', function(){
	
	return browserify({
	        entries: './js/main.js',
	        debug: true
	    })
	    .transform('browserify-shader')
    	.transform(stringify, {
            appliesTo: { includeExtensions: ['.html', '.xml', '.c', '.txt'] }
        })
        .transform('babelify', { presets: ['es2015'] })
	    .bundle()
	    .pipe( source('./bundle.js') )
	    .pipe( buffer() )
	    .pipe( uglify() )
	    .on( 'error', gutil.log )
	    .pipe( gulp.dest('./') );
	
})

gulp.task('default', ['sass', 'browserify'], function() {
	gulp.watch('./js/**/*', ['browserify']);
	gulp.watch('./sass/**/*', ['sass']);
});
