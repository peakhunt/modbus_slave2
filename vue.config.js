module.exports = {
  configureWebpack: {
    externals: {
      "serialport": "require('serialport')"
    }
  }
}
