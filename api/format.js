const bibutils = require('bibutils.js')
const path = require('path')

module.exports = (req, res) => {
  const { filename, mimetype } = req.query

  if (filename) {
    const extension = path.extname(filename)

    if (extension) {
      const format = bibutils.formats.extension[extension]

      if (format) {
        return res.json({ format })
      }
    }
  }

  if (mimetype) {
    const format = bibutils.formats.mimetype[mimetype]

    if (format) {
      return res.json({ format })
    }
  }

  res.json({})
}
