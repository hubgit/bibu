const bibutils = require('bibutils.js')

module.exports = (req, res) => {
  const { toFormat, fromFormat, input } = req.body

  bibutils.convert(fromFormat, toFormat, input, output => {
    res.send(output)
  })
}
