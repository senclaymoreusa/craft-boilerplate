const ExtractTextPlugin = require('extract-text-webpack-plugin')
const mix = require('laravel-mix')
mix.pug = require('laravel-mix-pug')

const env = process.env.NODE_ENV

const srcAssetPath = 'frontend/resources/assets'
const srcTplPath = (env == 'frontend') ? 'frontend/resources/templates' : 'templates'
const distPath = (env == 'frontend') ? 'frontend/dist' : 'web'

// SERVER_NAME
if ( env !== 'frontend' && process.env.SERVER_NAME !== undefined ) {
  var bsHost = process.env.SERVER_NAME
}

// browserSync Files
const bsFiles = [
  srcTplPath + '/**/*.twig',
  srcTplPath + '/**/*.pug',
  srcAssetPath + '/js/**/*.jsx',
  distPath + '/assets/css/**/*.css',
  distPath + '/assets/js/**/*.js'
]

// Extract jquery to the vendor.js file
// Feel free to add any other vendor dependencies that are rarely updated
mix.extract([ 'jquery', 'what-input', 'headroom.js', 'imagesloaded', 'isotope-layout', 'slick-carousel', 'readmore-js' ])
  .autoload({
      jquery: ['$', 'window.jQuery', "jQuery", "window.$", "jquery", "window.jquery"]
  });

mix.setPublicPath(distPath);

mix
  // Compile our main app entry point
  .js(srcAssetPath + '/js/app.js', distPath + '/assets/js')
  // Compile our main app styles
  .sass(srcAssetPath + '/sass/app.scss', distPath + '/assets/css')
  .options({ processCssUrls: false })
  // Copy over directory contents for images and fonts
  .copyDirectory(srcAssetPath + '/images', distPath + '/assets/images')
  .copyDirectory(srcAssetPath + '/fonts', distPath + '/assets/fonts')
  if( env == 'frontend' ){
    // Compile pug pages, Note: output var paths doesn't work
    mix.pug(srcTplPath + '/_pages/**/*.pug', '../../../dist')
  }

// Make sure we babelify proper modules and create font files
mix.webpackConfig({
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules\/(?!(foundation-sites)\/).*/,
        use: [
          {
            loader: 'babel-loader',
            options: mix.config.babel()
          }
        ]
      },
      {
        test: /\.font\.js/,
        loader: ExtractTextPlugin.extract({
          use: [
            'css-loader',
            'webfonts-loader'
          ]
        })
      }
    ],
  }
})

// Create manifest file for production, sourcemaps for dev
if ( mix.inProduction() ) { mix.version() }
else { mix.webpackConfig({ devtool: 'source-map' })
  .sourceMaps()
}

// browserSync Frontend
if(env == 'frontend') {
  mix.browserSync({
    proxy: false,
    server: {baseDir: distPath},
    host: 'localhost',
    port: 8000,
    files: bsFiles
  })
}
// browserSync Development & Production
else {
  mix.browserSync({
    proxy: 'localhost:8000',
    host: "'"+bsHost+"'",
    port: 8080,
    open: false,
    files: bsFiles
  })
}
