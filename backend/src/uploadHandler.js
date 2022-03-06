const { join } = require('path')
const { createWriteStream } = require('fs')
const busboy = require('busboy')
const { logger, pipelineAsync } = require('./util')

const ON_UPLOAD_EVENT = 'file-uploaded'

class UploadHandler {
  #io
  #socketId

  constructor(io, socketId) {
    this.#io = io
    this.#socketId = socketId
  }

  registerEvents(headers, onFinish) {
    const bb = busboy({ headers })

    bb.on('file', this.#onFile.bind(this))

    bb.on('finish', onFinish)

    return bb
  }

  #handleFileBytes(filename) {
    async function* handleData(data) {
      for await (const item of data) {
        const size = item.length

        // logger.info(
        //   `Received ${size} bytes of ${filename} to socketId: ${this.#socketId}`
        // )
        this.#io.to(this.#socketId).emit(ON_UPLOAD_EVENT, size)

        yield item
      }
    }

    return handleData.bind(this)
  }

  async #onFile(name, file, info) {
    const { filename } = info
    console.log(info)
    const saveFileTo = join(__dirname, '..', 'downloads', filename)
    logger.info(`Received file ${filename} to socketId: ${this.#socketId}`)

    await pipelineAsync(
      file,
      this.#handleFileBytes.apply(this, [filename]),
      createWriteStream(saveFileTo)
    )

    logger.info(
      `File ${filename} saved to ${join(
        __dirname,
        '..',
        'downloads'
      )} with success!`
    )
  }
}

module.exports = UploadHandler
