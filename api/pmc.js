const bibutils = require('bibutils.js')
const axios = require('axios')

module.exports = async (req, res) => {
  const { toFormat = 'ris', id } = req.query

  const response = await axios.get(
    'https://api.ncbi.nlm.nih.gov/lit/ctxp/v1/pmc/',
    {
      params: {
        format: 'ris',
        id
      } ,
      headers: {
        'User-Agent': 'bibu'
      }
    }
  )

  if (response && response.data) {
    bibutils.convert('ris', toFormat, response.data, output => {
      res.send(output)
    })
  } else {
    res.send(500)
  }
}
