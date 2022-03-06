const url = require('url')
const UploadHandler = require('./uploadHandler')
const { pipelineAsync, logger } = require('./util')

class Routes {
  #io

  constructor(io) {
    this.#io = io
  }

  async options(req, res) {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    })
    res.end()
  }

  async post(req, res) {
    const { headers } = req
    const {
      query: { socketId }
    } = url.parse(req.url, true)
    const redirectTo = headers.origin

    const uploadHandler = new UploadHandler(this.#io, socketId)

    const onFinish = (res, redirectTo) => () => {
      res.writeHead(303, {
        Connection: 'close',
        Location: `${redirectTo}?msg=Files uploaded successfully!`
      })
      res.end()
    }

    const busboyInstance = uploadHandler.registerEvents(
      headers,
      onFinish(res, redirectTo)
    )

    await pipelineAsync(req, busboyInstance)

    logger.info('Upload complete with success!')
  }
}

module.exports = Routes
