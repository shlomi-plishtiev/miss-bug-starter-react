import { start } from "repl"
import { utilService } from "./util.service.js"
import fs from 'fs'

const bugs = utilService.readJsonFile('data/bug.json')
const PAGE_SIZE = 3
export const bugService = {
    query,
    getById,
    remove,
    save
}

function query(filterBy = {}) {
    return Promise.resolve(bugs)
        .then(bugs => {
            if (filterBy.txt) {
                const regExp = new RegExp(filterBy.txt, 'i')
                bugs = bugs.filter(bug => regExp.test(bug.title))
            }
            if (filterBy.severity) {
                bugs = bugs.filter(bug => bug.severity >= +filterBy.severity)
            }
            if (filterBy.sortBy) {
                bugs = sortBugs(bugs, filterBy.sortBy, filterBy.sortDir)
            }
            if (filterBy.pageIdx !== undefined) {
                const startIdx = filterBy.pageIdx * PAGE_SIZE
                bugs = bugs.slice(startIdx, startIdx + PAGE_SIZE)
            }
            return bugs
        })
}

function sortBugs(bugs, sortBy, sortDir) {
    const direction = sortDir === '-1' ? -1 : 1
    return bugs.sort((a, b) => {
        if (sortBy === 'title') {
            return a.title.localeCompare(b.title) * direction
        } else if (sortBy === 'severity') {
            return (a.severity - b.severity) * direction
        } else if (sortBy === 'createdAt') {
            return (new Date(a.createdAt) - new Date(b.createdAt)) * direction
        }
        return 0
    })
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject('Cannot find bug - ' + bugId)
    return Promise.resolve(bug)
}

function remove(bugId, loggedinUser) {
    const idx = bugs.findIndex(bug => bug._id === bugId)
    if (idx === -1) return Promise.reject('No Such Bug')

    const bug = bugs[idx]
    console.log(bug);
    if (!loggedinUser.isAdmin &&
        bug.owner._id !== loggedinUser._id) {
        return Promise.reject('Not your bug')
    }
    bugs.splice(idx, 1)
    return _saveBugsToFile()
}


function save(bugToSave,loggedinUser) {
    if (bugToSave._id) {
        const bugIdx = bugs.findIndex(bug => bug._id === bugToSave._id)
        if (!loggedinUser.isAdmin &&
            bug.owner._id !== loggedinUser._id) {
            return Promise.reject('Not your bug')
        }
        bugs[bugIdx] = bugToSave
    } else {
        bugToSave._id = utilService.makeId()
        bugToSave.owner = loggedinUser
        bugs.unshift(bugToSave)
    }

    return _saveBugsToFile().then(() => bugToSave)
}


function _saveBugsToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 2)
        fs.writeFile('data/bug.json', data, (err) => {
            if (err) {
                return reject(err)
            }
            resolve()
        })
    })
}