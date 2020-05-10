import React from "react"
import * as RRD from 'react-router-dom'
import * as models from "../models"
import styles from './Poll.module.css'
import { useDispatch } from 'react-redux'
import * as PollsSlice from '../routes/Polls/pollsSlice'
import { Machine } from 'xstate'
import { useMachine } from '@xstate/react'

const dateTimeFormat = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
})

const pollStateMachine = Machine({
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
                        id: 'loadPoll',
                        src: 'loadPoll',
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
    poll: models.Poll
    index?: number
    loadPoll: () => Promise<any>
}

const Poll: React.FC<Props> = ({ poll, index, loadPoll }) => {
    const [state, send, service] = useMachine(pollStateMachine, {
        services: {
            loadPoll: async () => {
                return loadPoll()
            },
            ifLoadedSetFinal: (context, event) => (callback, onReceive) => {
                // If details for question are already loaded, then go directly go loaded state
                if (typeof poll.details === 'object') {
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
        if (poll.details === undefined) {
            send('LOAD')
        }
    }

    const number = typeof index === 'number'
        ? `${(index + 1).toString().padStart(3, '0')} `
        : ''

    const createdAtDate = new Date(poll.createdAt)
    const createdAtFormatted = dateTimeFormat.format(createdAtDate)

    let lastedUpdatedAtFormatted: string | undefined
    if (poll.details) {
        const lastedUpdatedAtDate = new Date(poll.details.updatedAt)
        lastedUpdatedAtFormatted = dateTimeFormat.format(lastedUpdatedAtDate)
    }

    const answers = poll.details
        ? [
            poll.details.answer1count || 34,
            poll.details.answer2count || 12,
            poll.details.answer3count || 4,
            poll.details.answer4count || 54,
        ]
        : []

    const totalAnswers = answers
        .reduce((sum, a) => sum += a, 0)

    const answersComputed = answers
        .map(answerCount => {
            const percentage = ((answerCount / totalAnswers) * 100).toFixed(0)

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
                    background: `linear-gradient(90deg, var(${startColor}) 0%, var(${endColor}) ${percentage}%, transparent ${percentage}%, transparent 100%)`
                }
            }
        })

    return (
        <div className={styles.poll}>
            <div onClick={onClickViewDetails}>
                <div className={styles.title}>
                    {number}{poll.question}
                </div>
                <div className={styles.answers}>
                    <div style={answersComputed[0]?.styles}>{poll.answer1}</div><div>{poll.details ? `✔ ${answersComputed[0].percentage} % (${answersComputed[0].count})` : null}</div>
                    <div style={answersComputed[1]?.styles}>{poll.answer2}</div><div>{poll.details ? `❌ ${answersComputed[1].percentage} % (${answersComputed[1].count})` : null}</div>
                    <div style={answersComputed[2]?.styles}>{poll.answer3}</div><div>{poll.details ? `❌ ${answersComputed[2].percentage} % (${answersComputed[2].count})` : null}</div>
                    <div style={answersComputed[3]?.styles}>{poll.answer4}</div><div>{poll.details ? `❌ ${answersComputed[3].percentage} % (${answersComputed[3].count})` : null}</div>
                </div>
            </div>
            {state.matches('view.open')
                && (
                    <>
                        <div className={styles.metadata}>
                            <dl>
                                <dt>📚 Tags</dt>
                                <dd>{poll.tags.map(t => <span className={styles.tag} key={t.id}>{t.name}</span>)}</dd>
                                <dt>🧑 Author</dt>
                                <dd><RRD.NavLink to={`/users/${poll.user.id}`}>{poll.user.name}</RRD.NavLink></dd>
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
                            <RRD.NavLink to={`/polls/${poll.id}`} ><span role="img" aria-label="link">🔗</span> Link</RRD.NavLink>
                        </div>
                    </>
                )}
        </div>
    )
}

type ContainerProps = {
    poll: models.Poll
    index?: number
}

const PollContainer: React.FC<ContainerProps> = (props) => {
    const dispatch = useDispatch()

    const loadPoll = async () => {
        return dispatch(PollsSlice.getPollThunk(props.poll.id))
    }

    return (
        <Poll
            {...props}
            loadPoll={loadPoll}
        />
    )
}

export default PollContainer