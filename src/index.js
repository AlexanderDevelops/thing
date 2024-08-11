const app = require('./express');

const tiktokConnection = require('./tiktokConnector');
const tiktokConnections = {}

function nineDigitId() {
    let id = ''
    let acceptableKeys = 'abcdefghijklmnopqrstuvwxyz123456789'.split('')
    for (i = 0; i < 9; i++) {
        id += acceptableKeys[Math.floor(Math.random() * acceptableKeys.length)]
    }
    return id
}

function findSessionUsingProperty(property, value) {
    for (let sessionID in tiktokConnections) {
        if (sessionID == null || tiktokConnections[sessionID] == null) continue;
        session = tiktokConnections[sessionID];
        if (session[property] == value) return session;
    }
}

app.post('/new-session', async (req, res) => {
    /*
        username : string
    */
    const body = req.body;
    console.log(body)

    console.log(findSessionUsingProperty('username', body.username))
    if (findSessionUsingProperty('username', body.username)) {
        return res.json({
            data: {},
            response: 401,
            error: 'There is already a session active on that username.'
        })
    }

    let id
    while (id == null) {
        let _id = nineDigitId()
        if (tiktokConnections[_id] && tiktokConnections[_id] != null) continue;
        id = _id
    }

    let connection = new tiktokConnection(body.username, id)
    let headerSent = false
    connection.WebcastPushConnection.connect().then(() => {}).catch(err => {
        console.log(err.message)
        if (err.message == 'Failed to retrieve room_id from page source. API Error 19881007 (user_not_found)') {
            if (headerSent) return;
            headerSent = true

            connection.Kill()
            tiktokConnections[connection.sessionID] = null

            res.json({
                response: 500,
                error: '<b>Error:</b> You\'re not livestreaming.'
            })
        }
    })
    tiktokConnections[id] = connection

    setTimeout(function() {
        if (headerSent) return;

        res.json({
            data: {
                sessionID: id
            },
            error: '',
            response: 200
        })
    }, 5000)
});

app.post('/get-gift-history', (req, res) => {
    /*
        sessionID : number,
        cleanAfter : boolean?
    */
    const body = req.body;

    const session = tiktokConnections[body.sessionID]
    if (!session) 
        return res.json({
            data: {},
            response: 401,
            error: 'There is no associated session with that id!'
        })

    res.json({
        data: {
            giftHistory: session.getGiftHistory()
        },
        error: '',
        response: 200
    })

    if (body.cleanAfter) {
        session.giftHistory = []
    }
});

app.post('/kill', (req, res) => {
    /*
        sessionID : number
    */
    const body = req.body;

    const session = tiktokConnections[body.sessionID]
    if (!session) 
        return res.json({
            data: {},
            response: 401,
            error: 'There is no associated session with that id!'
        })

    session.Kill()
    tiktokConnections[body.sessionID] = null
    console.log(tiktokConnections)

    res.json({
        data: {},
        error: '',
        response: 200
    })
});