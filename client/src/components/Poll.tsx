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
    poll: models.Poll
    index?: number
    loadPoll: () => Promise<any>
}

const Poll: React.FC<Props> = ({ poll, index, loadPoll }) => {
    const [state, send, service] = useMachine(questionStateMachine, {
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

    const answerStyles = poll.details
        ? [
            poll.details.percentageAnswer1 || 0.34,
            poll.details.percentageAnswer2 || 0.12,
            poll.details.percentageAnswer3 || 0.4,
            poll.details.percentageAnswer4 || 0.54,
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
            <div className={styles.title}>
                {number}{poll.question}
            </div>
            <div className={styles.answers}>
                <div>{poll.answer1}</div>
                <div>{poll.answer2}</div>
                <div>{poll.answer3}</div>
                <div>{poll.answer4}</div>
            </div>
            <div>
                <dl>
                    <dt>Tags</dt>
                    <dd>{poll.tags.map(t => <span className={styles.tag} key={t.id}>{t.name}</span>)}</dd>
                    <dt>State:</dt>
                    <dd>{poll.state}</dd>
                    <dt>Author</dt>
                    <dd>{poll.user.name}</dd>
                </dl>
            </div>
            <div>
                <RRD.NavLink to={`/polls/${poll.id}`} ><span role="img" aria-label="link">🔗</span> Link</RRD.NavLink>
            </div>
        </div>
    )
}

export default Poll