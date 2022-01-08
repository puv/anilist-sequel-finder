const axios = require('axios');
const express = require('express');
const anilist = require('anilist-node');
require('dotenv').config();
const app = express();
const domain = process.env.DOMAIN || 'http://localhost'; // include the http:// or https://
const port = process.env.PORT || 3001;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

app.all('/', (req, res) => {
    res.redirect('/auth');
});

app.all('/auth', (req, res) => {
    console.log('Authenticating...');
    res.redirect(`https://anilist.co/api/v2/oauth/authorize?client_id=${client_id}&redirect_uri=` + `${domain}:${port}/auth/callback` + `&response_type=code`);
});

app.all('/auth/callback', async (req, res) => {
    try {
        console.log('Authentication received...');
        const AUTHCODE = req.query.code;
        const GRANTCODE = await getGrant(AUTHCODE);
        const sequels = await getSequels(new anilist(GRANTCODE));
        watching = sequels[4]
        completed = sequels[2]
        paused = sequels[3]
        dropped = sequels[1]
        toWatch = sequels[0]
        console.log(watching.entries[0])
        res.send(JSON.stringify(watching.entries[0], null, 2));
    } catch {
        console.log("Error authenticating");
        res.sendStatus(401);
    }
});

async function getSequels(AL) {
    try {
        console.log('Getting sequels...');
        let user = await AL.user.getAuthorized();
        let ANIME = await AL.lists.anime(user.id);
        return ANIME;
    } catch (error) {
        console.log(e);
    }
}

async function getGrant(AUTHCODE) {
    var options = {
        url: 'https://anilist.co/api/v2/oauth/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        data: {
            'grant_type': 'authorization_code',
            'client_id': client_id,
            'client_secret': client_secret,
            'redirect_uri': `${domain}:${port}/auth/callback`, // http://example.com/callback
            'code': AUTHCODE, // The Authorization Code received previously
        }
    };
    try {
        console.log("Getting grant...");
        let res = await axios(options);
        return res.data.access_token;
    } catch (error) {
        console.log(error);
    }
}

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
})