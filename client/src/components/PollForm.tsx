import React from 'react'
import * as Auth0 from "../react-auth0-spa"
import useInput from '../hooks/useInput'
import * as models from '../models'
import Tags from './Tags'
import styles from "./QuestionForm.module.css"

type Props = {
    onSubmit(pollInput: models.PollInput): void
}

const onChangeInput = (setFn: Function) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value
    setFn(text)
}

const PollForm: React.FC<Props> = (props) => {
    const { isAuthenticated, loginWithRedirect } = Auth0.useAuth0()

    const [isOpen, setIsOpen] = React.useState(false)
    const [question, setQuestion, onChangeQuestion, onKeyDownQuestion] = useInput()
    const [answer1, setAnswer1, onChangeAnswer1, onKeyDownAnswer1] = useInput()
    const [answer2, setAnswer2, onChangeAnswer2, onKeyDownAnswer2] = useInput()
    const [answer3, setAnswer3, onChangeAnswer3, onKeyDownAnswer3] = useInput()
    const [answer4, setAnswer4, onChangeAnswer4, onKeyDownAnswer4] = useInput()
    const [tags, setTags] = React.useState<string[]>([])
    const [comment, setComment] = React.useState('')
    const [isSaveDisabled, setIsSaveDisabled] = React.useState(true)

    React.useEffect(() => {
        const isSaveDisabled = question === ''
            || answer1 === ''
            || answer2 === ''
            || answer3 === ''
            || answer4 === ''

        setIsSaveDisabled(isSaveDisabled)
    }, [question, answer1, answer2, answer3, answer4])

    const resetForm = () => {
        setQuestion('')
        setAnswer1('')
        setAnswer2('')
        setAnswer3('')
        setAnswer4('')
        setTags([])
    }

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const pollInput: models.PollInput = {
            question,
            answer1,
            answer2,
            answer3,
            answer4,
            tags,
        }

        props.onSubmit(pollInput)

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
                    <h3>Create Poll</h3>
                    <button type="button" onClick={onToggleOpen}>{isOpen ? 'Close' : 'Open'}</button>
                </div>
                <div>
                    <input
                        type="text"
                        value={question}
                        onChange={onChangeQuestion}
                        onKeyDown={onKeyDownQuestion}
                        onFocus={onFocusQuestion}
                        placeholder='Enter question'
                        autoComplete="off"
                        required={true}
                        style={{
                            width: "100%"
                        }}
                    />
                </div>
            </div>
            {isOpen &&
                <>
                    <div className={styles.fields}>
                        <div>Answer 1:</div>
                        <input type="text" value={answer1} onChange={onChangeAnswer1} onKeyDown={onKeyDownAnswer1} placeholder='First answer' autoComplete="off" required={true} />
                        <div>Answer 2:</div>
                        <input type="text" value={answer2} onChange={onChangeAnswer2} onKeyDown={onKeyDownAnswer2} placeholder='Second answer' autoComplete="off" required={true} />
                        <div>Answer 3:</div>
                        <input type="text" value={answer3} onChange={onChangeAnswer3} onKeyDown={onKeyDownAnswer3} placeholder='Third answer' autoComplete="off" required={true} />
                        <div>Answer 4:</div>
                        <input type="text" value={answer4} onChange={onChangeAnswer4} onKeyDown={onKeyDownAnswer4} placeholder='Fourth answer' autoComplete="off" required={true} />

                        <div>Tags:</div>
                        <Tags tags={tags} setTags={setTags} placeholder="balance, design, player, terran..." />

                        <div>Comment:</div>
                        <textarea className={styles.questionTextArea} rows={3} value={comment} onChange={onChangeComment} placeholder="Enter reason or explanation for no source link"></textarea>
                    </div>

                    <div>
                        {isAuthenticated
                            ? <button type="submit" disabled={isSaveDisabled}>Submit</button>
                            : <div>You must <button type="button" onClick={onClickLogIn}>Log In</button> to create a poll.</div>
                        }
                        <button type="reset">Reset</button>
                    </div>
                </>
            }

        </form>
    )
}

export default PollForm