const stream = require('youtube-audio-stream')

async function handleView(req, res) {
    try {
        for await (const chunk of stream(`${req.query.q}`)) {
            res.write(chunk)
        }
        res.end()
    } catch (err) {
        console.error(err)
        if (!res.headersSent) {
            res.writeHead(500)
            res.end('internal system error')
        }
    }
}

const express = require('express')
// import * as express from 'express';

var cors = require('cors')
// import * as cors from 'cors';

const app = express()

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

app.use(cors())
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*')

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true)

    // Pass to next layer of middleware
    next()
})

app.get('/api/stream', async function (req, res) {
    handleView(req, res)
})

app.get('/api/music', async function (req, res) {
    const url = req.query.q
    // console.log(url);
    const ytdl = require('ytdl-core')

    let info = await ytdl(url, {
        filter: 'audioonly'
    })

    info.pipe(res)
})


// Search API 

// // const api = require('./search')
// const api = require('./api/search')

// // app.use('/search', api) 
// app.use('/api/search', api) 

const yt = require('youtube-search-without-api-key')
app.get('/api/search', async function (req, res) {
    const url = req.query.q
    // let info = await getData(url)
    const videos = await yt.search(url);
    res.send(videos)
    console.log(videos)
})


let corsAnywhere = require('cors-anywhere')

let proxy = corsAnywhere.createServer({
    originWhitelist: [], // Allow all origins
    requireHeaders: [], // Do not require any headers.
    removeHeaders: [] // Do not remove any headers.
});

/* Attach our cors proxy to the existing API on the /proxy endpoint. */
app.get('/api/proxy/:proxyUrl*', (req, res) => {
    req.url = req.url.replace('/api/proxy/', '/'); // Strip '/proxy' from the front of the URL, else the proxy won't work.
    proxy.emit('request', req, res);
});
 

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
    // console.log(`Example app listening on port ${app}`)
})