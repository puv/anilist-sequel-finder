const request = require('request');
const express = require('express');
const anilist = require('anilist-node');
const { json } = require('express/lib/response');
require('dotenv').config();
const app = express();
const domain = process.env.DOMAIN || 'http://localhost'; // include the http:// or https://
const port = process.env.PORT || 3001;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

var options = {
    uri: 'https://anilist.co/api/v2/oauth/token',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    json: {
        'grant_type': 'authorization_code',
        'client_id': '{client_id}',
        'client_secret': '{client_secret}',
        'redirect_uri': `${domain}:${port}/auth/callback`, // http://example.com/callback
        'code': '{code}', // The Authorization Code received previously
    }
};

app.all('/', (req, res) => {
    res.redirect('/auth');
});

app.all('/auth', (req, res) => {
    console.log('Authenticating...');
    res.redirect(`https://anilist.co/api/v2/oauth/authorize?client_id=${client_id}&redirect_uri=` + `${domain}:${port}/auth/callback` + `&response_type=code`)
});

app.all('/auth/callback', async (req, res) => {
    try {
        console.log('Authentication received...');
        const AUTHCODE = req.query.code;
        console.log("Auth Code: " + AUTHCODE);
        await getSequels(new anilist(AUTHCODE));
        res.sendStatus(200);
    } catch {
        console.log("Error authenticating");
        res.sendStatus(401);
    }
});

async function getSequels(AL) {
    try {
        let user = await AL.user.getAuthorized();
        console.log(user[0]);
    } catch (error) {
        console.log(e);
    }
}

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
})