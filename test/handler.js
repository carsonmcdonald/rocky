const sinon = require('sinon')
const expect = require('chai').expect
const Emitter = require('events').EventEmitter
const Base = require('../lib/base')
const handler = require('../lib/handler')

suite('handler', function () {
  test('propagate events', function (done) {
    const spy = sinon.spy()
    const rocky = new Emitter
    const route = new Emitter
    route.useFor = function () {}
    const length = handler.events.length

    handler(rocky, route)

    handler.events.forEach(function (name) {
      rocky.on(name, spy)
    })

    handler.events.forEach(function (name, i) {
      route.emit(name, name)
      if ((i + 1) === length) assert()
    })

    function assert() {
      expect(spy.args.length).to.be.equal(length)
      expect(spy.args[0][0]).to.be.equal(handler.events[0])
      done()
    }
  })

  test('propagate middleware', function (done) {
    const spy = sinon.spy()
    const rocky = new Base
    const route = new Base
    const length = handler.middleware.length

    handler(rocky, route)

    handler.middleware.forEach(function (name, i) {
      rocky.useFor(name, spy)
    })

    handler.middleware.forEach(function (name, i) {
      route.mw.run(name, name)
      if ((i + 1) === length) assert()
    })

    function assert() {
      expect(spy.args.length).to.be.equal(length)
      expect(spy.args[0][0]).to.be.equal(handler.middleware[0])
      done()
    }
  })
})
