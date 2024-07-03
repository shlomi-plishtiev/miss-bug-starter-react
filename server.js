import express from 'express'
import cookieParser from 'cookie-parser'

import { loggerService } from './services/logger.service.js'
import { bugService } from './services/bug.service.js'
import { userService } from './services/user.service.js'

const app = express()
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())


const VISIT_LIMIT = 3
const COOKIE_EXPIRATION_TIME = 7 * 1000

const bugVisitLimitMiddleware = (req, res, next) => {
    let visitedBugs = req.cookies.visitedBugs ? JSON.parse(req.cookies.visitedBugs) : []
    const { bugId } = req.params
    if (visitedBugs.length >= VISIT_LIMIT && !visitedBugs.includes(bugId)) {
        return res.status(401).send('Wait for a bit')
    }

    next()
}

app.get('/api/bug', (req, res) => {

    const filterBy = {
        title: req.query.title,
        severity: +req.query.severity,
        pageIdx: req.query.pageIdx || undefined,
    }
    bugService.query(filterBy)
        .then(bugs => res.send(bugs))
})

app.post('/api/bug', (req, res) => {
    const loggedinUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot add car')

    const bugToSave = {
        title: req.body.title,
        severity: +req.body.severity,
        description: "problem when clicking Save",

    }
    bugService.save(bugToSave, loggedinUser)
        .then(bug => res.send(bug))
})

app.put('/api/bug', (req, res) => {
    const loggedinUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot delete car')


    const bugToSave = {
        _id: req.body._id,
        title: req.body.title,
        severity: +req.body.severity

    }
    bugService.save(bugToSave, loggedinUser)
        .then(bug => res.send(bug))
})

app.get('/api/bug/:bugId', bugVisitLimitMiddleware, (req, res) => {
    const { bugId } = req.params;
    bugService.getById(bugId).then(bug => {
        let visitedBugs = req.cookies.visitedBugs ? JSON.parse(req.cookies.visitedBugs) : [];

        if (!visitedBugs.includes(bugId)) {
            visitedBugs.push(bugId);
        }


        res.cookie('visitedBugs', JSON.stringify(visitedBugs), { maxAge: COOKIE_EXPIRATION_TIME })

        console.log('User visited the following bugs:', visitedBugs)

        res.send(bug);
    })
})

app.delete('/api/bug/:bugId', (req, res) => {
    const loggedinUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot update car')
        console.log(loggedinUser);
    const { bugId } = req.params
    console.log(bugId);

    bugService.remove(bugId, loggedinUser)
        .then(() => res.send(`bug (${bugId}) removed!`))
})

app.get('/api/user', (req, res) => {
    userService.query()
        .then((users) => {
            res.send(users)
        })
        .catch((err) => {
            console.log('Cannot load users', err)
            res.status(400).send('Cannot load users')
        })
})

app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params

    userService.getById(userId)
        .then(users => res.send(users))
})

app.post('/api/auth/login', (req, res) => {
    const credentials = req.body

    userService.checkLogin(credentials)
        .then(user => {
            if (user) {
                const loginToken = userService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(401).send('Invalid Credentials')
            }
        })
})

app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body

    userService.save(credentials)
        .then(user => {
            if (user) {
                const loginToken = userService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(400).send('Cannot signup')
            }
        })
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('logged-out!')
})


app.get('/', (req, res) => res.send('Hello there'))


const port =  process.env.PORT || 3030
app.listen(port, () =>
    loggerService.info((`Server listening on port http://127.0.0.1:${port}/`))
)

