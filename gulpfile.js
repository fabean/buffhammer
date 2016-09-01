var gulp = require('gulp');
var server = require('gulp-server-livereload');
 
gulp.task('webserver', function() {
  gulp.src('app')
    .pipe(server({
      fallback: 'index.html',
      livereload: true,
      directoryListing: true,
      open: true
    }));
});
