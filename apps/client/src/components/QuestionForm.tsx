import React from 'react'
import * as Auth0 from "../react-auth0-spa"
import useInput from '../hooks/useInput'
import * as models from '../models'
import Tags from './Tags'
import styles from "./QuestionForm.module.css"

type Props = {
    onSubmit(question: models.QuestionInput): void
}

const onChangeInput = (setFn: Function) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value
    setFn(text)
}

const Component: React.FC<Props> = (props) => {
    const { isAuthenticated, loginWithRedirect } = Auth0.useAuth0()

    const [isOpen, setIsOpen] = React.useState(false)
    const [question, setQuestion, onChangeQuestion, onKeyDownQuestion] = useInput()
    const [answer1, setAnswer1, onChangeAnswer1, onKeyDownAnswer1] = useInput()
    const [answer2, setAnswer2, onChangeAnswer2, onKeyDownAnswer2] = useInput()
    const [answer3, setAnswer3, onChangeAnswer3, onKeyDownAnswer3] = useInput()
    const [answer4, setAnswer4, onChangeAnswer4, onKeyDownAnswer4] = useInput()
    const [difficulty, setDifficulty] = React.useState(1)
    const [source, setSource, onChangeSource, onKeyDownSource] = useInput()
    const [tags, setTags] = React.useState<string[]>([])
    const [comment, setComment] = React.useState('')
    const onChangeDifficulty = onChangeInput(setDifficulty)
    const [isSaveDisabled, setIsSaveDisabled] = React.useState(true)

    React.useEffect(() => {
        const isSaveDisabled = question === ''
            || answer1 === ''
            || answer2 === ''
            || answer3 === ''
            || answer4 === ''

        setIsSaveDisabled(isSaveDisabled)
    }, [question, answer1, answer2, answer3, answer4, difficulty])

    const resetForm = () => {
        setQuestion('')
        setAnswer1('')
        setAnswer2('')
        setAnswer3('')
        setAnswer4('')
        setDifficulty(1)
        setSource('')
        setTags([])
    }

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const questionInput: models.QuestionInput = {
            question,
            answer1,
            answer2,
            answer3,
            answer4,
            difficulty,
            source,
            tags,
        }

        props.onSubmit(questionInput)

        resetForm()
    }

    const onReset = () => {
        resetForm()
    }

    const onToggleOpen = () => {
        setIsOpen(formState => !formState)
    }

    const onFocusQuestion = () => {
        setIsOpen(true)
    }

    const onChangeComment = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const comment = event.target.value
        setComment(comment)
    }

    const onClickLogIn = () => {
        loginWithRedirect()
    }

    return (
        <form onSubmit={onSubmit} onReset={onReset}>
            <div>
                <div className={styles.header}>
                    <h3>Create Question</h3>
                    <button type="button" onClick={onToggleOpen}>{isOpen ? '❌ Close' : 'Open'}</button>
                </div>
                <div>
                    <input
                        type="text"
                        value={question}
                        onChange={onChangeQuestion}
                        onKeyDown={onKeyDownQuestion}
                        onFocus={onFocusQuestion}
                        placeholder='Enter question. (E.g. How many shots does it take for a marine to kill a zealot?)'
                        autoComplete="off"
                        required={true}
                    />
                </div>
            </div>
            {isOpen &&
                <>
                    <div className={styles.fields}>
                        <div>Correct Answer 1:</div>
                        <input type="text" value={answer1} onChange={onChangeAnswer1} onKeyDown={onKeyDownAnswer1} placeholder='First answer' autoComplete="off" required={true} />
                        <div>Alternate Answer 2:</div>
                        <input type="text" value={answer2} onChange={onChangeAnswer2} onKeyDown={onKeyDownAnswer2} placeholder='Second answer' autoComplete="off" required={true} />
                        <div>Alternate Answer 3:</div>
                        <input type="text" value={answer3} onChange={onChangeAnswer3} onKeyDown={onKeyDownAnswer3} placeholder='Third answer' autoComplete="off" required={true} />
                        <div>Alternate Answer 4:</div>
                        <input type="text" value={answer4} onChange={onChangeAnswer4} onKeyDown={onKeyDownAnswer4} placeholder='Fourth answer' autoComplete="off" required={true} />
                        <div>Difficulty: </div>
                        <div className={styles.difficulty}>
                            <div>
                                <span>1</span><span>{difficulty}</span><span>10</span>
                            </div>
                            <input type="range" value={difficulty} onChange={onChangeDifficulty} min={1} max={10} />
                        </div>
                        <div>Tags:</div>
                        <Tags tags={tags} setTags={setTags} placeholder="terran, zerg, marine, attack..." />
                        <div>Source:</div>
                        <input type="text" value={source} onChange={onChangeSource} onKeyDown={onKeyDownSource} placeholder='Example: https://liquipedia.net/starcraft2/Nexus_(Legacy_of_the_Void)' autoComplete="off" />
                        <div>Comment:</div>
                        <textarea className={styles.questionTextArea} rows={3} value={comment} onChange={onChangeComment} placeholder="Enter reason or explanation for no source link"></textarea>
                    </div>

                    <div>
                        {isAuthenticated
                            ? <button type="submit" disabled={isSaveDisabled}>Submit</button>
                            : <div>You must <button type="button" onClick={onClickLogIn}>Log In</button> to create a question.</div>
                        }
                        <button type="reset">Reset</button>
                    </div>
                </>
            }

        </form>
    )
}

export default Component