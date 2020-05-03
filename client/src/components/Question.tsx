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

const dateTimeFormat = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
})

const questionStateMachine = Machine({
    id: 'questionState',
    strict: true,
    type: "parallel",
    states: {
        load: {
            initial: 'preload',
            states: {
                preload: {
                    invoke: {
                        id: 'ifLoadedSetFinal',
                        src: 'ifLoadedSetFinal',
                    },
                    on: {
                        LOAD: 'loading',
                        LOADED: 'loaded',
                    }
                },
                loading: {
                    invoke: {
                        id: 'loadQuestion',
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
    loadQuestion: () => Promise<any>
}

const Question: React.FC<Props> = ({ question, index, loadQuestion }) => {
    const [state, send, service] = useMachine(questionStateMachine, {
        services: {
            loadQuestion: async () => {
                return loadQuestion()
            },
            ifLoadedSetFinal: (context, event) => (callback, onReceive) => {
                // If details for question are already loaded, then go directly go loaded state
                if (typeof question.details === 'object') {
                    callback('LOADED')
                }
            }
        },
    })

    // React.useEffect(() => {
    //     service.onEvent(event => {
    //         console.log(`Event:  `, event.type, event)
    //     })

    //     const subscription = service.subscribe((state) => {
    //         console.log(`State: `, state.value, state.context)
    //     })

    //     return subscription.unsubscribe
    // }, [service])

    const onClickViewDetails = async () => {
        // Toggle View
        if (state.matches('view.open') === true) {
            send('CLOSE')
        }
        else if (state.matches('view.closed') === true) {
            send('OPEN')
        }

        // Load details if not loaded
        if (question.details === undefined) {
            send('LOAD')
        }
    }

    const number = typeof index === 'number'
        ? `${(index + 1).toString().padStart(3, '0')} `
        : ''

    const createdAtDate = new Date(question.createdAt)
    const createdAtFormatted = dateTimeFormat.format(createdAtDate)

    let lastedUpdatedAtFormatted: string | undefined
    if (question.details) {
        const lastedUpdatedAtDate = new Date(question.details.updatedAt)
        lastedUpdatedAtFormatted = dateTimeFormat.format(lastedUpdatedAtDate)
    }

    const answerStyles = question.details
        ? [
            question.details.percentageAnswer1 || 0.34,
            question.details.percentageAnswer2 || 0.12,
            question.details.percentageAnswer3 || 0.4,
            question.details.percentageAnswer4 || 0.54,
        ].map(percentage => {

            const startColor = state.matches('view.open')
                ? `--color-bg-start-open`
                : `--color-bg-start-closed`

            const endColor = state.matches('view.open')
                ? `--color-bg-end-open`
                : `--color-bg-end-closed`

            return { background: `linear-gradient(90deg, var(${startColor}) 0%, var(${endColor}) ${percentage * 100}%, transparent ${percentage * 100}%, transparent 100%)` }
        })
        : []

    return (
        <div className={styles.question}>
            <div onClick={onClickViewDetails}>
                <div className={styles.title} >
                    <div>{number}{question.question}</div><div>{state.matches('load.loading') ? 'Loading' : null} {question.difficulty}</div>
                </div>
                <div className={styles.answers}>
                    <div style={answerStyles[0]}>{question.answer1}</div><div>{question.details ? `✔ ${question.details.percentageAnswer1} %` : null}</div>
                    <div style={answerStyles[1]}>{question.answer2}</div><div>{question.details ? `❌ ${question.details.percentageAnswer2} %` : null}</div>
                    <div style={answerStyles[2]}>{question.answer3}</div><div>{question.details ? `❌ ${question.details.percentageAnswer3} %` : null}</div>
                    <div style={answerStyles[3]}>{question.answer4}</div><div>{question.details ? `❌ ${question.details.percentageAnswer4} %` : null}</div>
                </div>
            </div>
            {state.matches('view.open')
                && (
                    <>
                        <div className={styles.metadata}>
                            <dl>
                                <dt>📚 Tags</dt>
                                <dd>{question.tags.map(t => <span className={styles.tag} key={t.id}>{t.name}</span>)}</dd>
                                <dt>🧑 Author</dt>
                                <dd><RRD.NavLink to={`/users/${question.user.id}`}>{question.user.name}</RRD.NavLink></dd>
                                <dt>🔗 Source:</dt>
                                <dd>{question.source}</dd>
                                <dt>⌚ Average Duration:</dt>
                                <dd>1.23 s</dd>
                                <dt>⏲ Created:</dt>
                                <dd>{createdAtFormatted}</dd>
                                {lastedUpdatedAtFormatted
                                    && (
                                        <>
                                            <dt>⏲ Updated:</dt>
                                            <dd>{lastedUpdatedAtFormatted}</dd>
                                        </>
                                    )}
                            </dl>
                        </div>
                        <div>
                            <div>
                                🤔 Disagree with the question? Submit a change request: <button>📑 Submit Change</button>
                            </div>
                            <div>
                                <RRD.NavLink to={`/questions/${question.id}`} ><span role="img" aria-label="link">🔗</span> Link</RRD.NavLink>
                            </div>
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
        return dispatch(QuestionsSlice.getQuestionThunk(props.question.id))
    }

    return (
        <Question
            {...props}
            loadQuestion={loadQuestion}
        />
    )
}

export default QuestionContainer