'use strict';
var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),//генерации css sourscemaps
    imagemin = require('gulp-imagemin'),//сжатие картинок
    pngquant = require('imagemin-pngquant'),//сжатие png
    uglify = require('gulp-uglify'),//минификация js
    rigger = require('gulp-rigger'),//импорт одного файла в другой простой конструкцией //= footer.html
    watch = require('gulp-watch'),
    del = require('del'),//удаление файлов
    wiredep = require('wiredep').stream,//внесение ссылок на скрипты и стили из Bower в файл html
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),//автопрефиксы
    csswring = require('csswring'),//минификация css
    lost = require('lost'),//грид сетка
    stylelint = require('stylelint'),//линтер
    postcssfocus = require('postcss-focus'),//если есть hover, то обавляет focus
    fontmagician = require('postcss-font-magician'),
    browserSync = require("browser-sync"),
        reload = browserSync.reload;


var path = {
    dist: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'dist/',
        js: 'dist/js/',
        css: 'dist/css/',
        img: 'dist/img/',
        fonts: 'dist/fonts/'
    },
    src: { //Пути откуда брать исходники
        html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: 'src/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
        css: 'src/css/',
        img: 'src/img/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'src/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        css: 'src/css/**/*.css',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './dist'
};

//Создадим переменную с настройками нашего dev сервера:
var config = {
    server: {
        baseDir: "./dist"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Web_Shumer"
};
//Собираем пути к скриптам и стилям Bower 
gulp.task('html:bower', function () {
     gulp.src('./src/html/partials/bower.html') //Выберем файлы по нужному пути
        .pipe(wiredep({
            directory : "src/bower_components",
            })) //Забивает ссылки фреймворков в *.html <!-- bower:css/js --><!-- endbower -->
        .pipe(gulp.dest('./src/html')) //Выплюнем их в папку src
});
//Собираем html 
gulp.task('html', function () {
     gulp.src('./src/html/*.html') //Выберем файлы по нужному пути
        .pipe(rigger()) //Прогоним через rigger//Для сборки вставляем в нужных местах //= template/footer.html
        .pipe(gulp.dest('./dist')) //Выплюнем их в папку dist
        .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});
//Собираем CSS
gulp.task('css', function() {
 var processors = [
        fontmagician,
        lost,
        postcssfocus,
        stylelint,
        autoprefixer({browsers: ['last 2 version']}),
        //csswring

    ];
 return gulp.src('./src/css/style.css')
        .pipe(sourcemaps.init())//Инициализируем sourcemap
        .pipe(rigger()) //Прогоним через rigger
        .pipe(postcss(processors))
        .pipe(sourcemaps.write('./'))//Пропишем карты
        .pipe(gulp.dest('./dist/css/'))
        .pipe(reload({stream: true})); //И перезагрузим сервер
});
//Собираем js
gulp.task('js', function () {
    gulp.src(path.src.js) //Найдем наш main файл
        .pipe(rigger()) //Прогоним через rigger
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(uglify()) //Сожмем наш js
        .pipe(sourcemaps.write()) //Пропишем карты
        .pipe(gulp.dest(path.dist.js)) //Выплюнем готовый файл в build
        .pipe(reload({stream: true})); //И перезагрузим сервер
});
//Шрифты
gulp.task('fonts', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.dist.fonts))
});
//Собираем картинки
gulp.task('img', function () {
    return gulp.src(path.src.img)//Выберем наши картинки
        .pipe(imagemin({//Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(path.dist.img))//И бросим в dist
        .pipe(reload({stream: true}));
});
gulp.task('build', [
    'html',
    'css',
    'js',
    'fonts',
    'img'
]);
gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html');
    });
    watch([path.watch.css], function(event, cb) {
        gulp.start('css');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('img');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts');
    });
});
gulp.task('webserver', function () {
    browserSync(config);
});
gulp.task('clean', function() {
    return del([path.clean]),
    console.log('Files deleted!');
});
gulp.task('default', ['build', 'webserver', 'watch']);