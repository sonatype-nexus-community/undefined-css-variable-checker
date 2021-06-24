const path = require('path');

module.exports = {
  mode: 'production',
  context: __dirname,
  entry: './content.js',
  output: {
    filename: 'content.js',
    path: path.resolve(__dirname, 'dist')
  },
  devtool: 'inline-source-map'
};
