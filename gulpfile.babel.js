import { series, src, dest, } from 'gulp';
import babel from 'gulp-babel';
import minify from 'gulp-babel-minify';

function build() {
  return src('src/**/*.js')
    .pipe(babel())
    .pipe(minify({
      mangle: {
        keepClassName: true
      }
    }))
    .pipe(dest('dist'));
}

exports.build = build;

