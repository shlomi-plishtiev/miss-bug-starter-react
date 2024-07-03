import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { BugList } from '../cmps/BugList.jsx'
import { BugFilter } from '../cmps/BugFilters.jsx'

const { useState, useEffect } = React

export function BugIndex() {
    const [bugs, setBugs] = useState([])
    const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())

    useEffect(() => {
        loadBugs()
    }, [filterBy])

    function loadBugs() {
        bugService.query(filterBy)
            .then(bugs => {
                setBugs(bugs)
            })
            .catch(err => {
                console.log('err:', err)
            })
    }

    function onRemoveBug(bugId) {
        bugService
            .remove(bugId)
            .then(() => {
                console.log('Deleted Successfully!')
                const bugsToUpdate = bugs.filter((bug) => bug._id !== bugId)
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug removed')
            })
            .catch((err) => {
                console.log('Error from onRemoveBug ->', err)
                showErrorMsg('Cannot remove bug')
            })
    }

    function onAddBug() {
        const bug = {
            title: prompt('Bug title?'),
            severity: +prompt('Bug severity?'),
        }
        bugService
            .save(bug)
            .then((savedBug) => {
                console.log('Added Bug', savedBug)
                setBugs([...bugs, savedBug])
                showSuccessMsg('Bug added')
            })
            .catch((err) => {
                console.log('Error from onAddBug ->', err)
                showErrorMsg('Cannot add bug')
            })
    }

    function onEditBug(bug) {
        const severity = +prompt('New severity?')
        const bugToSave = { ...bug, severity }
        bugService
            .save(bugToSave)
            .then((savedBug) => {
                console.log('Updated Bug:', savedBug)
                const bugsToUpdate = bugs.map((currBug) =>
                    currBug._id === savedBug._id ? savedBug : currBug
                )
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug updated')
            })
            .catch((err) => {
                console.log('Error from onEditBug ->', err)
                showErrorMsg('Cannot update bug')
            })
    }

    function onSetFilter(filterBy) {
        setFilterBy((prevFilterBy) => ({ ...prevFilterBy, ...filterBy }))
    }
    function togglePagination() {
        setFilterBy(prevFilter => {
            return { ...prevFilter, pageIdx: prevFilter.pageIdx === undefined ? 0 : undefined }
        })
    }

    function onChangePage(diff) {
        if (filterBy.pageIdx === undefined) return
        setFilterBy(prevFilter => {
            let nextPageIdx = prevFilter.pageIdx + diff
            if (nextPageIdx < 0) nextPageIdx = 0
            return { ...prevFilter, pageIdx: nextPageIdx }
        })
    }
    function onSetSort(sortBy) {
        setFilterBy(prevFilterBy => ({
            ...prevFilterBy,
            sortBy,
            sortDir: prevFilterBy.sortDir === 1 ? -1 : 1
        }))
    }
    return (
        <main>
            <section className='info-actions'>
                <BugFilter onSetFilter={onSetFilter} filterBy={filterBy} />
            </section>
            <section className="pagination">
                <button className="pagination-btn" onClick={togglePagination} >Toggle Pagination</button>
                <button className="pagination-btn" onClick={() => onChangePage(-1)}>-</button>
                {filterBy.pageIdx + 1 || '  No Pagination  '}
                <button className="pagination-btn" onClick={() => onChangePage(1)}>+</button>
                <br />
                <h4>Sort by:</h4>
                <button className="pagination-btn" onClick={() => onSetSort('title')}>Title</button>
                <button className="pagination-btn" onClick={() => onSetSort('severity')}>Severity</button>
                <button className="pagination-btn" onClick={() => onSetSort('createdAt')}>Created At</button>
                <br />
                <h4>Add Bug</h4>
                <button onClick={onAddBug} className='pagination-btn'>Add Bug ⛐</button>
            </section>
            <main>
                <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />
            </main>
        </main>
    )
}
