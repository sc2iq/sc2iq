import { Form } from "@remix-run/react"

export const formName = 'formNameSearch'

export const SearchForm = () => {
  return (
    <Form method="post">
      <h1>Search</h1>
      <div>
        <label htmlFor='text'>Text:</label>
        <input type="text" placeholder='Marine?' id="text" name="text" required />
      </div>
      <div>
        <input type="hidden" name="formName" value={formName} />
        <button type="submit">Create</button>
      </div>
    </Form>
  )
}
