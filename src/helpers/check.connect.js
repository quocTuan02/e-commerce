const mongoose = require('mongoose')
const os = require('os')
const process = require('process')

const _SECONDS = 5000
// count Connections
const countConnect = () => {
    const numConnections = mongoose.connections.length
    console.log(`Number of connections: ${numConnections}`)
}

// check over load
const checkOverload = () => {
    setInterval(() => {
        const numConnections = mongoose.connections.length
        const numCores = os.cpus().length
        const memoryUsage = process.memoryUsage().rss
        // Example maximum number of connections based on number of cores
        const maxConnections = numCores * 5

        console.log(`Active connections: ${numConnections}`)
        console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`)

        if (numConnections > maxConnections) {
            console.log(`Connection overload detected`)
            // notify.send(`Connection overload detected`)
        }
    }, _SECONDS) // Monitor every 5 second
}

module.exports = {
    countConnect,
    checkOverload
}