import React from "react"
import useInput from '../hooks/useInput'
import styles from "./Tags.module.css"

type Props = {
    tags: string[]
    setTags: React.Dispatch<React.SetStateAction<string[]>>
    placeholder?: string
}

const Tags: React.FC<Props> = (props) => {
    const [tagInput, setTagInput, onChangeNewTag] = useInput()
    const onClickRemoveTag = (tagIndex: number): void => {
        const newTags = [...props.tags]
        newTags.splice(tagIndex, 1)

        props.setTags(newTags)
    }

    const onBluerTagInput = (event: React.FocusEvent<HTMLInputElement>) => {
        if (tagInput.length >= 3) {
            if (props.tags.includes(tagInput)) {
                return
            }

            props.setTags(tags => [...tags, tagInput])
            setTagInput('')
        }
    }

    const onKeyDownTagInput = (event: React.KeyboardEvent<HTMLInputElement>): void => {
        switch (event.key) {
            case 'Enter':
            case 'Tab': {
                if (tagInput.length >= 3) {
                    event.preventDefault()
                    if (props.tags.includes(tagInput)) {
                        return
                    }

                    props.setTags(tags => [...tags, tagInput])
                    setTagInput('')
                }
                break
            }
            case 'Backspace': {
                if (tagInput.length === 0) {
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
                value={tagInput}
                onChange={onChangeNewTag}
                onKeyDown={onKeyDownTagInput}
                onBlur={onBluerTagInput}
                placeholder={props.placeholder}
                autoComplete="off"
            />
        </div>
    )
}

export default Tags