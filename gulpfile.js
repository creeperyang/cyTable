'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var AUTOPREFIXER_BROWSERS = [
    'Android 2.3',
    'Android >= 4',
    'Chrome >= 20',
    'Firefox >= 24',
    'Explorer >= 8',
    'iOS >= 6',
    'Opera >= 12',
    'Safari >= 6'
];

gulp.task('styles', function() {
    return gulp.src('demo/styles/app.scss')
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            outputStyle: 'nested', // libsass doesn't support expanded yet
            precision: 10,
            includePaths: ['.'],
            onError: console.error.bind(console, 'Sass error:')
        }))
        .pipe($.postcss([
            require('autoprefixer-core')({
                browsers: AUTOPREFIXER_BROWSERS
            })
        ]))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('demo/styles'))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('copy', function() {
    return gulp.src('src/*.{js,scss}')
        .pipe($.if('*.scss', gulp.dest('demo/styles')))
        .pipe($.if('*.js', gulp.dest('demo/scripts/lib')));
});

gulp.task('eslint', function() {
    return gulp.src(['src/*.js', 'gulpfile.js']) //, 'demo/scripts/**/*.js'
        .pipe(reload({
            stream: true,
            once: true
        }))
        .pipe($.eslint())
        .pipe($.eslint.format())
        // always let gulp break down when eslint fails
        .pipe($.eslint.failOnError());
        // maybe dont let it break down when run with browserSync
        // .pipe($.if(!browserSync.active, $.eslint.failOnError()));
});

// lint test files
gulp.task('lint:test', function() {
    return gulp.src(['test/*.js', 'karma.conf.js'])
        .pipe(reload({
            stream: true,
            once: true
        }))
        .pipe($.eslint())
        .pipe($.eslint.format())
        .pipe($.eslint.failOnError());
});

gulp.task('build', ['clean', 'eslint'], function() {
    return gulp.src('src/*.{js,scss}')
        .pipe($.if('*.js', $.ngAnnotate()))
        .pipe($.sourcemaps.init())
        .pipe($.if('*.js', $.uglify()))
        .pipe($.if('*.scss', $.sass({
            outputStyle: 'nested', // libsass doesn't support expanded yet
            precision: 10,
            includePaths: ['.'],
            onError: console.error.bind(console, 'Sass error:')
        })))
        .pipe($.if('*.scss', $.postcss([
            require('autoprefixer-core')({
                browsers: AUTOPREFIXER_BROWSERS
            })
        ])))
        .pipe($.if('*.scss', $.csso()))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('dist'));
});

gulp.task('images', function() {
    return gulp.src('demo/images/source/*')
        .pipe($.cache($.imagemin({
            progressive: true,
            interlaced: true,
            // don't remove IDs from SVGs, they are often used
            // as hooks for embedding and styling
            svgoPlugins: [{
                cleanupIDs: false
            }]
        })))
        .pipe(gulp.dest('demo/images'));
});

gulp.task('fonts', function() {
    return gulp.src(require('main-bower-files')({
        filter: '**/*.{eot,svg,ttf,woff,woff2}',
        includeDev: true,
        overrides: {
            'bootstrap-sass-official': {
                'main': [
                    'assets/fonts/**/*',
                    'assets/stylesheets/_bootstrap.scss',
                    'assets/javascripts/bootstrap.js'
                ]
            }
        }
    })).pipe(gulp.dest('demo/fonts'));
});

gulp.task('clean', require('del').bind(null, ['dist']));

gulp.task('serve', ['build', 'wiredep', 'fonts', 'styles', 'images'], function() {
    browserSync({
        notify: false,
        port: 9000,
        server: {
            baseDir: ['dist', 'demo'],
            routes: {
                '/bower_components': 'bower_components'
            }
        }
    });

    // watch for changes
    gulp.watch([
        'dist/*',
        'demo/*.html',
        'demo/scripts/{,*/}*.js',
        'demo/styles/{,*/}*.css',
        'demo/images/**/*'
    ]).on('change', reload);

    gulp.watch('demo/styles/**/*.scss', ['styles']);
    gulp.watch('src/*.{js,scss}', ['build']);
    gulp.watch('bower.json', ['wiredep']);
});

// inject bower components
gulp.task('wiredep', function() {
    var wiredep = require('wiredep').stream;

    gulp.src('demo/styles/*.scss')
        .pipe(wiredep({
            devDependencies: true,
            ignorePath: /^(\.\.\/)+/,
            fileTypes: {
                scss: {
                    block: /(([ \t]*)\/\/\s*bower:*(\S*))(\n|\r|.)*?(\/\/\s*endbower)/gi,
                    detect: {
                        css: /@import\s['"](.+css)['"]/gi,
                        sass: /@import\s['"](.+sass)['"]/gi,
                        scss: /@import\s['"](.+scss)['"]/gi
                    },
                    replace: {
                        css: '@import "../{{filePath}}";',
                        sass: '@import "../{{filePath}}";',
                        scss: '@import "../{{filePath}}";'
                    }
                }
            }
        }))
        .pipe(gulp.dest('demo/styles'));

    gulp.src('./demo/index.html')
        .pipe(wiredep({
            // angular-mocks is used for test, not for demo
            exclude: ['angular-mocks'],
            ignorePath: /^(\.\.\/)*\.\./,
            devDependencies: true,
            overrides: {
                // dont include jquery and bootstrap.js
                // not sure why `exclude` not work for this
                'bootstrap-sass-official': {
                    'main': [],
                    'dependencies': {}
                }
            }
        }))
        .pipe(gulp.dest('./demo'));
});

// deploy to gh-pages
gulp.task('deploy', function() {
    return gulp.src('./gitbook-for-ghpages/_book/**/*')
        .pipe($.ghPages());
});

gulp.task('demo', ['serve']);

gulp.task('default', ['build'],function() {
    return gulp.src('dist/*').pipe($.size({
        title: 'cy-table',
        gzip: true
    }));
});
