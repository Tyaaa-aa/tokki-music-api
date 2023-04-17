// import * as yt from 'youtube-search-without-api-key';
const yt = require('youtube-search-without-api-key')
// const YoutubeMusicApi = require('youtube-music-api')

// const server = require('server')
// // import * as server from 'server';

// const {
//     get,
//     post
// } = server.router

const express = require('express')
// import * as express from 'express';

var cors = require('cors')
// import * as cors from 'cors';

const app = express()

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

app.get('/', async function (req, res) {
    const url = req.query.search
    // let info = await getData(url)
    const videos = await yt.search(url);
    res.send(videos)
    console.log(videos)
})

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
    // console.log(`Example app listening on port ${app}`)
})