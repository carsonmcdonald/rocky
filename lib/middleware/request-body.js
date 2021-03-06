const rawBody = require('raw-body')
const typer = require('media-typer')
const common = require('./common')

module.exports = function transformRequestBody(middleware, filter) {
  return function (req, res, next) {
    if (req.method === 'GET' || req.method === 'HEAD') {
      return next()
    }

    // Apply the request filter is necessary
    if (filter && !common.filterRequest(filter, req)) {
      return next()
    }

    // If body is already present, just continue with it
    if (req.body) {
      return middleware(req, res, finisher)
    }

    var encoding = 'utf8'
    var contentType = req.headers['content-type']
    if (contentType) {
      encoding = typer.parse(contentType).parameters.charset || encoding
    }

    rawBody(req, {
      length: req.headers['content-length'],
      encoding: encoding
    }, getBody)

    function getBody(err, body) {
      if (err) return next(err)
      req.body = req._originalBody = body

      var length = +(req.headers['content-length'] || req._readableState.length)
      if (length) req._originalBodyLength = length

      middleware(req, res, finisher)
    }

    function finisher(err, body, enc) {
      if (err) return next(err)

      if (body) {
        // Expose the new body in the request
        req.headers['content-length'] = body.length
        req.body = req._newBody = body
        req._newBodyEncoding = enc || encoding
      }

      next()
    }
  }
}
