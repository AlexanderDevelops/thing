const { WebcastPushConnection } = require('tiktok-live-connector');

class Session {
    constructor(username, sessionID) {
        ////////////// SETUP
        this.username = username;
        this.sessionID = sessionID;
        this.killed = false
        this.giftHistory = []

        this.WebcastPushConnection = new WebcastPushConnection(this.username);


        ////////////// MAIN FUNCTIONS
        this.Kill = function() {
            console.log('killed')
            this.WebcastPushConnection.disconnect()
            this.onGiftEvent.disconnect()
            this.killed = true
        }


        ////////////// RETURNING FUNCTIONS
        this.getGiftHistory = function() {
            return this.giftHistory
        }


        ////////////// EVENTS FUNCTIONS

        ////////////// EVENTS
        // this.connection = this.WebcastPushConnection.connect()

        this.onGiftEvent = this.WebcastPushConnection.on('gift', data => {
            console.log(this.giftHistory)

            if (data.repeatEnd) {
                const historicalEvent = {
                    sender: data.userId,
                    offering: data.giftId,
                    count: data.repeatCount,
                    timestamp: Date.now()
                }

                console.log(historicalEvent)

                this.giftHistory.push(historicalEvent)
            } else if (!data.repeatEnd) {
                console.log(`${data.userId} is on a ${data.repeatCount} streak sending ${data.giftId}`)
            }
        })
    }
}

module.exports = Session