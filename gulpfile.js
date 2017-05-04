/**
 * Site
 * @version 1.2.0
 * @anthor: hoofei@gmail.com
 */
/* jshint strict: false, quotmark: false */

// Load plugins
var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var del = require('del');
var footer = require('gulp-footer');
var gulpif = require('gulp-if');
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var livereload = require('gulp-livereload');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

var pkg = require('./package.json');
var date = new Date();
pkg.date = date.getFullYear() + '-' + ('00' + (date.getMonth() + 1)).slice(-2) + '-' +
    ('00' + date.getDate()).slice(-2) + ' ' + ('00' + date.getHours()).slice(-2) + ':' +
    ('00' + date.getMinutes()).slice(-2) + ':' + ('00' + date.getSeconds()).slice(-2);
var timestamp = ['\n/*',
    ' <%= pkg.name %>',
    ' v<%= pkg.version %>',
    ' <%= pkg.date %>',
    ' */'].join('');

// Config
var toggle = {
    autoprefix: true,
    jshint: false,
    sourcemaps: true
};
var paths = {
    scripts: [
        'src/scripts/core/*.js',
        'src/scripts/plugins/*.js',
        'src/scripts/*.js'
    ],
    polyfill: 'src/scripts/polyfill/*.js',
    styles: 'src/styles/' + pkg.name + '.less',
    images: [
        'src/images/**/*.jpg',
        'src/images/**/*.gif',
        'src/images/**/*.png',
        'src/images/**/*.svg'
    ],
    fonts: [
        'components/fontawesome/fonts/fontawesome.otf',
        'components/fontawesome/fonts/fontawesome-webfont.eot',
        'components/fontawesome/fonts/fontawesome-webfont.svg',
        'components/fontawesome/fonts/fontawesome-webfont.ttf',
        'components/fontawesome/fonts/fontawesome-webfont.woff'
    ],
    lib: [
        'components/jquery/dist/jquery.min.js',
        'components/html5shiv/dist/html5shiv.min.js'
    ],
    watchs: {
        scripts: 'src/scripts/**/*.js',
        styles: 'src/styles/**/*.less',
        dist: 'dist/**/*'
    }
};
var dests = {
    styles: './dist/css',
    scripts: './dist/js',
    images: './dist/images',
    fonts: './dist/fonts',
    maps: '../maps'
};
var options = {
    autoprefix: {
        browsers: ['last 2 versions']
    },
    fileName: pkg.name,
    polyfillName: 'ie',
    less: {
        compress: true
    },
    jshint: '.jshintrc',
    jshintReporter: 'default',
    rename: {
        suffix: '.min'
    }
};

// Tasks
// 通常情况，以下任务是不能修改的，如果遇到特殊情况需要修改，请注明！

// Styles
gulp.task('styles', function () {
    gulp.src(paths.styles)
        .pipe(plumber({
            errorHandler: notify.onError('Error: <%= error.message %>')
        }))
        .pipe(gulpif(toggle.sourcemaps, sourcemaps.init()))
        .pipe(less(options.less))
        .pipe(gulpif(toggle.autoprefix, autoprefixer(options.autoprefix)))
        .pipe(rename(options.rename))
        .pipe(footer(timestamp, {
            pkg: pkg
        }))
        .pipe(gulpif(toggle.sourcemaps, sourcemaps.write(dests.maps)))
        .pipe(gulp.dest(dests.styles));
});

// Scripts
gulp.task('scripts', function () {
    gulp.src(paths.scripts)
        .pipe(plumber({
            errorHandler: notify.onError('Error: <%= error.message %>')
        }))
        .pipe(gulpif(toggle.sourcemaps, sourcemaps.init()))
        .pipe(gulpif(toggle.jshint, jshint(options.jshint)))
        .pipe(gulpif(toggle.jshint, jshint.reporter(options.jshintReporter)))
        .pipe(concat(options.fileName + '.js'))
        .pipe(rename(options.rename))
        .pipe(uglify())
        .pipe(footer(timestamp, {
            pkg: pkg
        }))
        .pipe(gulpif(toggle.sourcemaps, sourcemaps.write(dests.maps)))
        .pipe(gulp.dest(dests.scripts));
    // 单独打包IE Polyfill
    gulp.src(paths.polyfill)
        .pipe(plumber({
            errorHandler: notify.onError('Error: <%= error.message %>')
        }))
        .pipe(gulpif(toggle.sourcemaps, sourcemaps.init()))
        .pipe(concat(options.polyfillName + '.js'))
        .pipe(uglify())
        .pipe(gulpif(toggle.sourcemaps, sourcemaps.write(dests.maps)))
        .pipe(gulp.dest(dests.scripts));
});

// Images
gulp.task('images', function () {
    gulp.src(paths.images)
        .pipe(gulp.dest(dests.images));
});

// Fonts
gulp.task('coypFonts', function () {
    gulp.src(paths.fonts)
        .pipe(gulp.dest(dests.fonts));
});

// Lib
gulp.task('copyLib', function () {
    gulp.src(paths.lib)
        .pipe(gulp.dest(dests.scripts));
});

// Clean
gulp.task('clean', function () {
    return del(['dist/css', 'dist/js', 'dist/fonts', 'dist/maps']);
});

// Build
gulp.task('build', ['clean'], function () {
    gulp.start('styles', 'scripts', 'images', 'coypFonts', 'copyLib');
});

// Default
gulp.task('default', ['build']);

// Release 发布
gulp.task('release', function () {
    // 因为 UAE 不支持 .map 文件类型，所以暂时在发布时去除 sourcemaps
    toggle.sourcemaps = false;
    gulp.start('build');
});

// Watch
gulp.task('watch', function () {
    // .js files
    gulp.watch(paths.watchs.scripts, ['scripts']);
    // .less files
    gulp.watch(paths.watchs.styles, ['styles']);
    // images files
    gulp.watch(paths.images, ['images']);
    // LiveReload server
    livereload.listen();
    // Watch any files in dist/, reload on change
    gulp.watch(paths.watchs.dist).on('change', livereload.changed);
});
