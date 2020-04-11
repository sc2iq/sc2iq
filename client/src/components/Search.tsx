import React from 'react'
import * as models from "../models"
import Tags from "./Tags"
import styles from "./Search.module.css"

const defaultPhrase = ''
const defaultTags: string[] = []
const defaultMinDifficulty = 1
const defaultMaxDifficulty = 10

type Props = {
    onSubmit: (search: models.Search) => void,
}

const Search: React.FC<Props> = (props) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [phrase, setPhrase] = React.useState('')
    const [tags, setTags] = React.useState<string[]>([])
    const [minDifficulty, setMinDifficulty] = React.useState(1)
    const [maxDifficulty, setMaxDifficulty] = React.useState(10)
    const [isSaveDisabled, setIsSaveDisabled] = React.useState(true)

    React.useEffect(() => {
        const isSaveDisabled = phrase === defaultPhrase
            && tags.length === defaultTags.length
            && minDifficulty === defaultMinDifficulty
            && maxDifficulty === defaultMaxDifficulty

        setIsSaveDisabled(isSaveDisabled)
    }, [phrase, tags, minDifficulty, maxDifficulty])

    const resetForm = () => {
        setPhrase(defaultPhrase)
        setTags(defaultTags)
        setMinDifficulty(defaultMinDifficulty)
        setMaxDifficulty(defaultMaxDifficulty)
    }

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const searchInput: models.Search = {
            phrase,
            tags,
            minDifficulty,
            maxDifficulty,
        }

        props.onSubmit(searchInput)
    }

    const onToggleOpen = () => {
        setIsOpen(formState => !formState)
    }

    const onFocusPhrase = (event: React.FocusEvent<HTMLInputElement>) => {
        setIsOpen(true)
    }

    const onChangePhrase = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPhrase(event.target.value)
    }

    const onChangeMinDifficulty = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value)
        if (value < maxDifficulty) {
            setMinDifficulty(value)
        }
    }

    const onChangeMaxDifficulty = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value)
        if (value > minDifficulty) {
            setMaxDifficulty(value)
        }
    }

    return (
        <form onSubmit={onSubmit}>
            <div>
                <div className={styles.header}>
                    <h3>Search</h3>
                    <button type="button" onClick={onToggleOpen}>{isOpen ? 'Close' : 'Open'}</button>
                </div>
                <div>
                    <input type="text" placeholder="Enter phrase" value={phrase} onChange={onChangePhrase} onFocus={onFocusPhrase} />
                </div>
            </div>
            {isOpen &&
                <>
                    <div className={styles.fields}>
                        <div>Includes Tags:</div>
                        <Tags tags={tags} setTags={setTags} />
                        <div>Difficulty Range: </div>
                        <div className={styles.difficulty}>
                            <div>
                                <span>1</span><span>{minDifficulty} &lt;= Question Difficulty &lt;= {maxDifficulty}</span><span>10</span>
                            </div>
                            <input type="range" value={minDifficulty} onChange={onChangeMinDifficulty} min={1} max={10} />
                            <input type="range" value={maxDifficulty} onChange={onChangeMaxDifficulty} min={1} max={10} />
                        </div>
                    </div>

                    <div>

                    <button type="submit" disabled={isSaveDisabled}>Submit</button>
                    <button type="reset" onClick={resetForm}>Reset</button>
                    </div>
                </>
            }
        </form>
    )
}

export default Search