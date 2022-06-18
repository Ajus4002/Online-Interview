const jwt = require("jsonwebtoken");
const User = require("./models/user");
const Admin = require("./models/admin");

const clients = []

function findClientsById(id) {
    return clients.filter(client => client.user?._id?.toString() === id)
}

function findClientById(id) {
    return clients.find(client => client.user?._id?.toString() === id)
}

function WebSocketHandler(ws, req) {
    this.user = null
    this.userType = null

    this.interviewInfo = null

    this.send = function (data) {
        ws.send(JSON.stringify(data))
    }

    const onMessage = (msg) => {
        console.log(msg)
        msg = JSON.parse(msg);

        const isPrivileged = this.userType === 'admin';

        if (isPrivileged && msg.to === 'server') {
            handlePrivilegedMessage(msg);
            return;
        }

        if (msg.subject === 'request-session') {
            this.interviewInfo = msg.info
            broadcastAdmins({ subject: 'client-connected', client: msg.info })
            return;
        }

        handleCommonMessage(findClientsById(msg.to), msg);
    }

    const handleCommonMessage = (to, msg) => {
        if (to.length) {
            to.forEach(t => t.send(msg));
            return;
        }

        switch (msg.subject) {
            case 'offer':
                this.send({ subject: 'offer-rejected', from: msg.id, reason: 'Remote user not found' })
                break;

            case 'answer':
                this.send({ subject: 'answer-rejected', from: msg.id, reason: 'Remote user not found' })
                break;

            case 'ice-candidate':
                this.send({ subject: 'ice-candidate-rejected', from: msg.id, reason: 'Remote user not found' })
                break;

            case  'end-session':
                break;
        }
    }

    const handlePrivilegedMessage = (msg) => {
        if (msg.subject === 'get-active-clients') {
            const list = clients
                .filter(client => client.userType === 'user' && client.interviewInfo)
                .map(client => client.interviewInfo);

            this.send({ subject: 'active-clients', clients: list })
            return;
        }

        if (msg.subject === 'get-client-details') {
            const to = findClientById(msg.id)
            if (!to) {
                this.send({ subject: 'not-found', from: msg.id, reason: 'Client not found'})
                return;
            }

            this.send({ subject: 'client-details', client: to.user })
            return;
        }
    }

    function broadcastAdmins(data) {
        for (const client of clients) {
            if (client.userType === 'admin') {
                client.send(data)
            }
        }
    }

    const authenticate = () => {
        const token = req.query.token
        const type = req.query.type

        let decoded = null
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET, {audience: type})
        } catch (e) {
            console.log(e)
            return ws.close()
        }

        const onSuccess = (user) => {
            if (!user) {
                onError()
                return
            }

            this.user = user
            this.userType = type
            clients.push(this)
        }

        const onError = () => {
            console.log('no user')
            return ws.close()
        }

        if (type === 'user') {
            User.findById(decoded.sub).exec()
                .then(onSuccess)
                .catch(onError)
        } else {
            Admin.findById(decoded.sub).exec()
                .then(onSuccess)
                .catch(onError)
        }
    }

    authenticate()

    const onClose = () => {
        const i = clients.findIndex(v => v === this)
        if (i === -1) return

        clients.splice(i, 1)

        if (this.userType === 'user') {
            broadcastAdmins({ subject: 'client-disconnected', client: this.user });
        }
    }

    // ws.on('open', onOpen);
    ws.on('close', onClose);
    ws.on('error', onClose);
    ws.on('message', onMessage);
}

WebSocketHandler.sendMsg = function (to, data) {
    const c = findClientsById(to)
    c.forEach(v => v.send(data))
}

module.exports = WebSocketHandler
