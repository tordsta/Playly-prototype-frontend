const path = require("path");

module.exports = {
    entry: './src/index.js',
    mode: 'production',
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        },
        { 
          test: /\.css$/, 
          loader: "style-loader!css-loader" 
        },
        {
          test: /\.(pdf|jpg|png|gif|svg|ico)$/,
          use: [
            {
              loader: 'url-loader'
            },
          ]
        },
        {   
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          loader: "file-loader"
        }
      ]
    },
    resolve: {
      extensions: ['*', '.js', '.jsx'],
      alias: {
        react: path.resolve('./node_modules/react') //Makes sure the same instance of react is used in the application and in the games
      }
    },
    output: {
      path: __dirname + '/dist',
      publicPath: '/',
      filename: 'bundle.js'
    },
    devServer: {
      contentBase: './dist'
    },
    node: {
      fs: "empty",
      net: "empty"
    }
};