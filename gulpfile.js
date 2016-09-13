var gulp = require('gulp'),
  browserSync = require('browser-sync'),
  del = require('del'),
  wiredep = require('wiredep');

const reload = browserSync.reload;

var sass = require('gulp-sass'),
  globbing = require('gulp-css-globbing'),
  gulpFilter = require('gulp-filter'),
  jsonminify = require('gulp-jsonminify'),
  plumber = require('gulp-plumber'),
  autoprefixer = require('gulp-autoprefixer'),
  gulpif = require('gulp-if'),
  useref = require('gulp-useref'),
  imagemin = require('gulp-imagemin'),
  cache = require('gulp-cache'),
  uglify = require('gulp-uglify'),
  size = require('gulp-size'),
  minifyCss = require('gulp-minify-css'),
  minifyHtml = require('gulp-minify-html');

/**
 * styles
 */

gulp.task('styles', function () {
  return gulp.src('app/styles/*.scss')
    .pipe(globbing({
      extensions: ['.scss']
    }))
    .pipe(sass())
    .pipe(plumber())
    .pipe(sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 1 version', 'ie >= 9']
    }))
    .pipe(sass({
      includePaths: ['./styles']
    }))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({
      stream: true
    }));
});

/**
 * html
 */

gulp.task('html', ['styles'], function () {
  const assets = useref.assets({
    searchPath: ['.tmp', 'app', '.']
  });

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe(gulpif('*.js', uglify()).on('error', function (err) {
      console.log(err);
    })).pipe(gulpif('*.css', minifyCss({
      compatibility: '*'
    }).on('error', function (err) {
      console.log(err);
    })))
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(gulpif('*.html', minifyHtml({
      conditionals: true,
      loose: true
    })))
    .pipe(gulp.dest('dist'));
});

/**
 * images
 */

var bitMapFilter = gulpFilter(['**/*.{jpg,png,gif}']);

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe(gulpif(gulpif.isFile, cache(imagemin({
        progressive: true,
        interlaced: true,
        // don't remove IDs from SVGs, they are often used
        // as hooks for embedding and styling
        svgoPlugins: [{
          cleanupIDs: false
        }]
      }))
      .on('error', function (err) {
        console.log(err);
        this.end();
      })))
    .pipe(bitMapFilter)
    .pipe(gulp.dest('dist/images'));
});

/**
 * compress data
 */

gulp.task('dataCompress', function () {
  return gulp.src(['app/data/**/*.json'])
    .pipe(jsonminify())
    .pipe(gulp.dest('dist/data'));
});

/**
 * fonts
 */

gulp.task('fonts', function () {
  return gulp.src(require('main-bower-files')({
      filter: '**/*.{eot,svg,ttf,woff,woff2}'
    }).concat('app/fonts/**/*'))
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

/**
 * extras
 */

gulp.task('extras', function () {
  return gulp.src([
    'app/*.*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

/**
 * tasks
 */

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['styles'], function () {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    },
    ghostMode: false
  });

  gulp.watch([
    'app/*.html',
    'app/scripts/**/*.js',
    'app/images/**/*',
    '.tmp/fonts/**/*',
    'app/data/**/*'
  ], {
    debounceDelay: 2000
  }).on('change', reload);

  gulp.watch('app/styles/**/*.scss', ['styles']);
  gulp.watch('app/fonts/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
  gulp.watch('app/images/**/*.{jpg,png,gif}', {
    debounceDelay: 2000
  });
});

gulp.task('serve:dist', function () {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });
});

gulp.task('serve:test', function () {
  browserSync({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch('test/spec/**/*.js').on('change', reload);
});

// inject bower components
gulp.task('wiredep', function () {
  gulp.src('app/styles/*.scss')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('build', ['html', 'images', 'fonts', 'dataCompress', 'extras'], function () {
  return gulp.src('dist/**/*').pipe(size({
    title: 'build',
    gzip: true
  }));
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
