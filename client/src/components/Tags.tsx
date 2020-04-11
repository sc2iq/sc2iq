import React from "react"
import useInput from '../hooks/useInput'
import styles from "./Tags.module.css"

type Props = {
    tags: string[]
    setTags: React.Dispatch<React.SetStateAction<string[]>>
    placeholder?: string
}

const Tags: React.FC<Props> = (props) => {
    const [newTag, setNewTag, onChangeNewTag] = useInput()
    const onClickRemoveTag = (tagIndex: number): void => {
        const newTags = [...props.tags]
        newTags.splice(tagIndex, 1)

        props.setTags(newTags)
    }

    const onKeyDownTagInput = (event: React.KeyboardEvent<HTMLInputElement>): void => {

        switch (event.key) {
            case 'Enter':
            case 'Tab': {
                if (newTag.length >= 3) {
                    event.preventDefault()
                    if (props.tags.includes(newTag)) {
                        return
                    }

                    props.setTags(tags => [...tags, newTag])
                    setNewTag('')
                }
                break
            }
            case 'Backspace': {
                if (newTag.length === 0) {
                    props.setTags(tags => {
                        const tagsCopy = [...tags]
                        tagsCopy.pop()
                        return tagsCopy
                    })
                }
                break
            }
            case ' ': {
                event.preventDefault()
                break
            }
        }
    }

    return (
        <div>
            <div>
                {props.tags.map((t, i) =>
                    <div className={styles.tag} key={i}>{t} <button type="button" onClick={() => onClickRemoveTag(i)}>✖</button></div>
                )}
            </div>
            <input
                type="text"
                value={newTag}
                onChange={onChangeNewTag}
                onKeyDown={onKeyDownTagInput}
                placeholder={props.placeholder}
                autoComplete="off"
            />
        </div>
    )
}

export default Tags