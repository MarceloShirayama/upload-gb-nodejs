const pino = require('pino')
const pretty = require('pino-pretty')
const { promisify } = require('util')
const { pipeline } = require('stream')

const pipelineAsync = promisify(pipeline)

const stream = pretty({
  colorize: true,
  translateTime: 'SYS:standard',
  ignore: 'pid,hostname'
})

const logger = pino(stream)

module.exports = { logger, pipelineAsync, promisify }
