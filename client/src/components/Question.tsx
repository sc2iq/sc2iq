import React from "react"
import * as RRD from 'react-router-dom'
import * as models from "../models"
import styles from './Question.module.css'
import * as client from "../services/client"
import { useSelector, useDispatch } from 'react-redux'
import * as QuestionsSlice from '../routes/Questions/questionsSlice'
import { Machine } from 'xstate'
import { useMachine } from '@xstate/react'
import { delay } from "../utilities"

const questionStateMachine = Machine({
    id: 'questionState',
    strict: true,
    type: "parallel",
    states: {
        load: {
            initial: 'preload',
            states: {
                preload: {
                    on: {
                        LOAD: 'loading'
                    }
                },
                loading: {
                    invoke: {
                        src: 'loadQuestion',
                        onDone: 'loaded'
                    }
                },
                loaded: {
                    type: 'final'
                }
            }
        },
        view: {
            initial: 'closed',
            states: {
                closed: {
                    on: {
                        OPEN: 'open'
                    }
                },
                open: {
                    on: {
                        CLOSE: 'closed'
                    }
                }
            }
        }
    }
})

enum View {
    OPEN = 'open',
    CLOSED = 'closed',
}

type Props = {
    question: models.Question
    index?: number
    loadQuestion: () => Promise<void>
}

const Question: React.FC<Props> = ({ question, index, loadQuestion }) => {
    const [state, send, service] = useMachine(questionStateMachine, {
        services: {
            loadQuestion: async () => {
                await delay(1000)
            }
        }
    })

    const onClickViewDetails = async () => {
        if (state.matches('view.open') === true) {
            send('CLOSE')
        }
        else if (state.matches('view.closed') === true) {
            send('OPEN')
        }

        if (question.details === undefined) {
            send('LOAD')
            loadQuestion()
        }
    }

    const number = typeof index === 'number'
        ? `${(index + 1).toString().padStart(3, '0')} `
        : ''

    return (
        <div className={styles.question}>
            <div onClick={onClickViewDetails}>
                <div className={styles.title} >
                    <div>{number}{question.question}</div><div>{question.difficulty}</div>
                </div>
                <div className={styles.answers}>
                    <div>{question.answer1}</div><div>12%</div>
                    <div>{question.answer2}</div><div>12%</div>
                    <div>{question.answer3}</div><div>12%</div>
                    <div>{question.answer4}</div><div>12%</div>
                </div>
            </div>
            {state.matches('load.loading')
                && (
                    <div>Loading</div>
                )}
            {state.matches('view.open')
                && (
                    <>
                        <div>
                            <dl>
                                <dt>Tags</dt>
                                <dd>{question.tags.map(t => <span className={styles.tag} key={t.id}>{t.name}</span>)}</dd>
                                <dt>Author</dt>
                                <dd><RRD.NavLink to={`/users/${question.user.id}`}>{question.user.name}</RRD.NavLink></dd>
                                <dt>Difficulty</dt>
                                <dd>{question.difficulty}</dd>
                                <dt>Source:</dt>
                                <dd>{question.source}</dd>
                                <dt>Avg. Correct</dt>
                                <dd>79%</dd>
                            </dl>
                        </div>
                        <div>
                            Disagree with the question? Submit a change request: <button>Submit Change</button>
                        </div>
                        <div>
                            <RRD.NavLink to={`/questions/${question.id}`} ><span role="img" aria-label="link">🔗</span> Link</RRD.NavLink>
                        </div>
                    </>
                )}
        </div>
    )
}

type ContainerProps = {
    question: models.Question
    index?: number
}

const QuestionContainer: React.FC<ContainerProps> = (props) => {
    const dispatch = useDispatch()

    const loadQuestion = async () => {
        dispatch(QuestionsSlice.getQuestionThunk(props.question.id))
    }

    return (
        <Question
            {...props}
            loadQuestion={loadQuestion}
        />
    )
}

export default QuestionContainer