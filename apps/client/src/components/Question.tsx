import React from "react"
import * as RRD from 'react-router-dom'
import * as models from "../models"
import styles from './Question.module.css'
import { useDispatch } from 'react-redux'
import * as QuestionsSlice from '../routes/Questions/questionsSlice'
import { Machine } from 'xstate'
import { useMachine } from '@xstate/react'

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

    const answers = question.details
        ? [
            question.details.answer1count || 34,
            question.details.answer2count || 12,
            question.details.answer3count || 4,
            question.details.answer4count || 54,
        ]
        : []

    const totalAnswers = answers
        .reduce((sum, a) => sum += a, 0)

    const answersComputed = answers
        .map(answerCount => {
            const percentage = answerCount / totalAnswers
            const percentageString = (percentage * 100).toFixed(0)
            
            const startColor = state.matches('view.open')
                ? `--color-bg-start-open`
                : `--color-bg-start-closed`

            const endColor = state.matches('view.open')
                ? `--color-bg-end-open`
                : `--color-bg-end-closed`

            return {
                count: answerCount,
                percentage,
                styles: {
                    background: `linear-gradient(90deg, var(${startColor}) 0%, var(${endColor}) ${percentageString}%, transparent ${percentageString}%, transparent 100%)`
                }
            }
        })

    return (
        <div className={styles.question}>
            <div onClick={onClickViewDetails}>
                <div className={styles.title} >
                    <div>{number}{question.question}</div><div>{question.difficulty}</div>
                </div>
                <div className={styles.answers}>
                    <div style={answersComputed[0]?.styles}>{question.answer1}</div><div>{question.details ? `✔ ${answersComputed[0].percentage} % (${answersComputed[0].count})` : null}</div>
                    <div style={answersComputed[1]?.styles}>{question.answer2}</div><div>{question.details ? `❌ ${answersComputed[1].percentage} % (${answersComputed[1].count})` : null}</div>
                    <div style={answersComputed[2]?.styles}>{question.answer3}</div><div>{question.details ? `❌ ${answersComputed[2].percentage} % (${answersComputed[2].count})` : null}</div>
                    <div style={answersComputed[3]?.styles}>{question.answer4}</div><div>{question.details ? `❌ ${answersComputed[3].percentage} % (${answersComputed[3].count})` : null}</div>
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
                        <div className={styles.changeLink}>
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