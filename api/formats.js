const bibutils = require('bibutils.js')

module.exports = (req, res) => {
  res.json(bibutils.formats)
}
