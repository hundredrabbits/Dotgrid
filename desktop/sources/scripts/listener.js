'use strict'

const dgram = require('dgram')

function Listener (dotgrid) {
  this.server = dgram.createSocket('udp4')

  this.start = function () {

  }

  this.server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`)
    server.close()
  })

  this.server.on('message', (msg, rinfo) => {
    console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`)
  })

  this.server.on('listening', () => {
    const address = this.server.address()
    console.log(`server listening ${address.address}:${address.port}`)
  })

  this.server.bind(49160)
}
