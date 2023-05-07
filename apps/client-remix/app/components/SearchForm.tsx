import * as Icons from "@heroicons/react/24/solid"
import { Form } from "@remix-run/react"
import z from "zod"
import { FormDataEntries, SearchInput } from "~/types"

export const formName = 'formNameSearch'

export const schema = z.object({
  text: z.string(),
  tags: z.string().transform(tagsString => tagsString.split(',').map(s => s.trim().toLowerCase())),
  difficultyMin: z.string().transform(s => parseFloat(s)),
  difficultyMax: z.string().transform(s => parseFloat(s)),
})

export function getQuestionInput(formDataEntries: FormDataEntries): SearchInput {
  return schema.parse(formDataEntries)
}

export const Component = () => {
  return (
    <Form method="post">
      <h1><Icons.MagnifyingGlassIcon className="h-10 w-10" /> Search</h1>
      <div>
        <label htmlFor='text'>Text:</label>
        <input type="text" placeholder='Marine?' id="text" name="text" required />
      </div>
      <div>
        <input type="hidden" name="formName" value={formName} />
        <button type="submit">Submit</button>
      </div>
    </Form>
  )
}
