
import { utilService } from './util.service.js'

const BASE_URL = '/api/bug/'

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter,
    getEmptyBug
}


function query(filterBy = {}) {
    return axios.get(BASE_URL, { params: filterBy })
        .then(res => res.data)
        .then(bugs => {
            if (filterBy.txt) {
                const regExp = new RegExp(filterBy.txt, 'i')
                bugs = bugs.filter(bug => regExp.test(bug.title) || regExp.test(bug.description))
            }

            if (filterBy.severity) {
                bugs = bugs.filter(bug => bug.severity >= filterBy.severity)
            }

            if (filterBy.sortBy) {
                bugs = sortBugs(bugs, filterBy.sortBy)
            }

            return bugs
        })
}

function sortBugs(bugs, sortBy) {
    if (sortBy === 'title') {
        return bugs.sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortBy === 'severity') {
        return bugs.sort((a, b) => a.severity - b.severity)
    }
    return bugs
}

function getById(bugId) {
    return axios.get(BASE_URL + bugId)
        .then(res => res.data)
}

function remove(bugId) {
    return axios.delete(BASE_URL + bugId)
        .then(res => res.data)
}

function save(bug) {
    if (bug._id) {
        return axios.put(BASE_URL, bug)
            .then(res => res.data)

    } else {
        return axios.post(BASE_URL, bug)
            .then(res => res.data)

    }
}

function getDefaultFilter() {
    return { txt: '', severity: '', sortBy: '' }
}

function getEmptyBug() {
    return { title: '', description: '', severity: 5 }
}