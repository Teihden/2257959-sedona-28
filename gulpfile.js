import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import autoprefixer from 'autoprefixer';
import browsersync from 'browser-sync';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import { stacksvg } from 'gulp-stacksvg';
import { deleteAsync } from 'del';
import sourcemaps from 'gulp-sourcemaps';

const browser = browsersync.create();

// CSS
export const css = () => {
  return gulp.src('source/less/styles.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso(),
    ]))
    .pipe(rename(function (path) {
      path.extname = '.min.css';
    }))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// HTML
const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      removeComments: true,
      useShortDoctype: true,
    }))
    .pipe(gulp.dest('build'));
}

// Javascript
const scripts = () => {
  return gulp.src('source/js/*.js')
    .pipe(sourcemaps.init())
    .pipe(terser())
    .pipe(rename(function (path) {
      path.extname = '.min.js';
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('build/js'));
}

// Images
const optimizeImages = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(squoosh())
    .pipe(gulp.dest('build/img'));
}

const copyImages = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(gulp.dest('build/img'));
}

// WebP
const createWebp = () => {
  return gulp.src([
    'source/img/**/*.{png,jpg}',
    '!source/img/favicons/*.{png,jpg}',
  ])
    .pipe(squoosh({
      webp: {
        quality: 90,
      }
    }))
    .pipe(gulp.dest('build/img'));
}

// SVG
const svg = () =>
  gulp.src([
    'source/img/**/*.svg',
    '!source/img/icons/*.svg',
    '!source/img/backgrounds/*.svg'
  ])
    .pipe(svgo())
    .pipe(gulp.dest('build/img'));

const stack = () => {
  return gulp.src([
    'source/img/icons/*.svg',
    'source/img/backgrounds/*.svg'
  ])
    .pipe(svgo())
    .pipe(stacksvg({ output: `stack` }))
    .pipe(gulp.dest('build/img'));
}

// Copy resourses
const copy = (done) => {
  gulp.src([
    'source/fonts/*.{woff2,woff}',
    'source/*.ico',
    'source/manifest.webmanifest',
  ], {
    base: 'source',
  })
    .pipe(gulp.dest('build'))

  done();
}

// Clean
const clean = () => deleteAsync(['build']);

// Server
export const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });

  done();
}

// Reload
const reload = (done) => {
  browser.reload();

  done();
}

// Watcher
const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(css));
  gulp.watch('source/js/*.js', gulp.series(scripts, reload));
  gulp.watch('source/*.html', gulp.series(html, reload));
}

// Build
export const build = gulp.series(
  clean,
  gulp.parallel(
    optimizeImages,
    createWebp,
    copy,
    css,
    html,
    scripts,
    svg,
    stack,
  ),
);

// Default
export default gulp.series(
  clean,
  gulp.parallel(
    copyImages,
    createWebp,
    copy,
    css,
    html,
    scripts,
    svg,
    stack,
  ),
  gulp.series(
    server,
    watcher
  ));
