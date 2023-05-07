import * as Icons from "@heroicons/react/24/solid"
import { Form } from "@remix-run/react"
import z from "zod"
import { tagsString } from "~/helpers"
import { FormDataEntries, SearchInput } from "~/types"

export const formName = 'formNameSearch'

export const schema = z.object({
  text: z.string(),
  tags: z.string().transform(s => tagsString(s)),
  difficultyMin: z.string().transform(s => parseFloat(s)),
  difficultyMax: z.string().transform(s => parseFloat(s)),
})

export function getFormData(formDataEntries: FormDataEntries): SearchInput {
  return schema.parse(formDataEntries)
}

export const Component = () => {
  return (
    <Form method="post" replace className="border p-5 rounded-xl flex flex-col gap-2 bg-slate-200 border-slate-400">
      <h1 className="flex gap-2 items-center text-lg font-medium"><Icons.MagnifyingGlassIcon className="h-8 w-8" /> Search</h1>
      <input className="p-1 px-2" type="text" autoComplete="off" placeholder='Marine?' id="text" name="text" required />
      <div className="flex gap-4">
        <label className="flex gap-2 items-center" htmlFor='tags'>Tags:</label>
        <input className="flex-grow p-1 px-2" type="text" autoComplete="off" placeholder='terran, units' id="tags" name="tags" />
      </div>
      <div className="flex gap-4">
        <label className="flex gap-2 items-center" htmlFor='difficultyMin'>Min Difficulty:</label>
        <input className="flex-grow p-1 px-2" type="number" autoComplete="off" id="difficultyMin" name="difficultyMin" required min={1} max={10} defaultValue={1} />
      </div>
      <div className="flex gap-4">
        <label className="flex gap-2 items-center" htmlFor='difficultyMax'>Max Difficulty:</label>
        <input className="flex-grow p-1 px-2" type="number" autoComplete="off" id="difficultyMax" name="difficultyMax" required min={1} max={10} defaultValue={10} />
      </div>
      <input type="hidden" name="formName" value={formName} />
      <div className="flex flex-row gap-2 mt-2">
        <button className="border px-4 py-2 flex gap-2 items-center bg-slate-600 text-slate-100 rounded-lg" type="submit"><Icons.PencilIcon className="h-5 w-5" /> Submit</button>
        <button className="border px-4 py-2 flex gap-2 items-center bg-slate-400 rounded-lg" type="reset"><Icons.ArrowPathIcon className="h-5 w-5" /> Reset</button>
      </div>
    </Form>
  )
}
