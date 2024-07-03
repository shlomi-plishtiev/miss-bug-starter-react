const {useState, useEffect} = React

export function BugFilter({filterBy, onSetFilter}) {
  const [filterByToEdit, setFilterByToEdit] = useState(filterBy)

  useEffect(() => {
    onSetFilter(filterByToEdit)
  }, [filterByToEdit])

  function handleChange({target}) {
    const field = target.name
    const value = target.type === 'number' ? +target.value || '' : target.value
    setFilterByToEdit((prevFilterBy) => ({...prevFilterBy, [field]: value}))
  }



  const {txt, severity} = filterByToEdit
  return (
    <section className="bug-filter full main-layout">
      <h2>Filter Our Bugs</h2>

      <form >
        <label htmlFor="txt">Vendor:</label>
        <input
          value={txt}
          onChange={handleChange}
          name="txt"
          id="txt"
          type="text"
          placeholder="By Text"
        />

        <label htmlFor="severity">Severity:</label>
        <input
          value={severity}
          onChange={handleChange}
          type="number"
          name="severity"
          id="severity"
          placeholder="By Severity"
        />

      </form>
    </section>
  )
}
