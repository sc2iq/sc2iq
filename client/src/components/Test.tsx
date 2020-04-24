import React from 'react'
import * as Auth0 from "../react-auth0-spa"
import * as models from '../models'
import * as Utils from '../utilities'
import { usePrevious } from '../hooks/usePrevious'
import { useEventListener } from '../hooks/useEventListener'
import styles from './Test.module.css'
import TestLevelComponent, { TestLevel } from './TestLevel'
import { Machine, interpret } from 'xstate'
import { useMachine } from '@xstate/react'

const testStateMachine = Machine({
    id: 'testState',
    initial: 'preload',
    states: {
        preload: {
            on: {
                LOAD: {
                    target: 'ready',
                },
            },
        },
        ready: {
            on: {
                START: {
                    target: 'started',
                },
            }
        },
        started: {
            on: {
                END: {
                    target: 'ended',
                }
            }
        },
        ended: {
            on: {
                RESTART: {
                    target: 'preload',
                },
            },
            initial: 'overview',
            states: {
                overview: {
                    on: {
                        DETAILS: {
                            target: 'details'
                        }
                    },
                },
                details: {
                    on: {
                        OVERVIEW: {
                            target: 'overview'
                        }
                    }
                },
            }
        },
    }
})

enum TestState {
    PreLoad = 'PreLoad',
    Ready = 'Ready',
    Started = 'Started',
    Saving = 'Saving',
    Ended = 'Ended',
    Details = 'Details',
}

type Props = {
    onClickReady(): void
    questions: models.Question[]
    onSubmit(score: models.ScoreInput): void
    getKeyAsync(): Promise<string>
    score?: models.ScoreComputed
}

const Component: React.FC<Props> = (props) => {
    const [state, dispatch, service] = useMachine(testStateMachine)
    React.useEffect(() => {
        const subscription = service.subscribe((state) => {
            // simple state logging
            console.log(`State: `, state.value, state.event, state)
        })

        return subscription.unsubscribe
    }, [service])

    const { isAuthenticated, loginWithRedirect } = Auth0.useAuth0()
    const [testLevel, setTestLevel] = React.useState(TestLevel.Easy)
    const [testState, setTestState] = React.useState(TestState.PreLoad)
    const currentTestState = React.useRef(testState)
    React.useEffect(() => {
        currentTestState.current = testState
    }, [testState])

    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0)
    const [key, setKey] = React.useState<string>()
    const [answers, setAnswers] = React.useState<models.AnswerInput[]>([])

    const currentQuestion = props.questions[currentQuestionIndex]
    // const randomizedAnswers = React.useMemo(() => {
    //     return currentQuestion
    //         ? Utils.randomizeList([currentQuestion.answer1, currentQuestion.answer2, currentQuestion.answer3, currentQuestion.answer4])
    //         : []
    // }, [currentQuestionIndex])

    const onClickAnswer = (answerIndex: number) => () => {
        if (currentQuestion === undefined) {
            return
        }

        const currentTime = new Date()
        const answer: models.AnswerInput = {
            questionId: currentQuestion.id,
            submittedAt: currentTime.toJSON(),
            answerIndex,
        }

        setAnswers(answers => [...answers, answer])
        setCurrentQuestionIndex(i => i + 1)
    }

    console.count('render')
    console.log(`render ${currentTestState.current} ${currentQuestionIndex}`)

    const onClick1 = onClickAnswer(1)
    const onClick2 = onClickAnswer(2)
    const onClick3 = onClickAnswer(3)
    const onClick4 = onClickAnswer(4)

    const listener = (event: KeyboardEvent) => {
        console.count('listener')
        console.log(`keydown: ${event.key} ${currentTestState.current} ${currentQuestionIndex}`)

        if (currentTestState.current === TestState.PreLoad) {
            switch (event.key) {
                case "Enter": {
                    onClickReady()
                    break
                }
            }
        }
        else if (currentTestState.current === TestState.Ready) {
            switch (event.key) {
                case "Enter": {
                    onClickStartTest()
                    break
                }
            }
        }
        else if (currentTestState.current === TestState.Started) {
            switch (event.key) {
                case "1": {
                    onClick1()
                    break
                }
                case "2": {
                    onClick2()
                    break
                }
                case "3": {
                    onClick3()
                    break
                }
                case "4": {
                    onClick4()
                    break
                }
            }
        }
        else if (currentTestState.current === TestState.Ended) {
            switch (event.key) {
                case "Enter": {
                    if (event.ctrlKey) {
                        onClickRestart()
                    }
                    else {
                        onClickDetails()
                    }
                    break
                }
            }
        }
        else if (currentTestState.current === TestState.Details) {
            switch (event.key) {
                case "ArrowUp":
                case "ArrowLeft": {
                    onClickPreviousAnswerReview()
                    break
                }
                case "ArrowDown":
                case "ArrowRight": {
                    onClickNextAnswerReview()
                    break
                }
                case "Backspace": {
                    onClickScoreOverview()
                    break
                }
                case "Enter": {
                    if (event.ctrlKey) {
                        onClickRestart()
                    }
                    else {
                        onClickScoreOverview()
                    }
                    break
                }
            }
        }
    }

    useEventListener('keydown', listener, document)

    React.useEffect(() => {
        if (currentQuestionIndex >= props.questions.length
            && props.questions.length !== 0) {
            setTestState(TestState.Saving)
            if (!key) {
                throw new Error(`You attempted to submit a test but the key was not set.`)
            }

            const score: models.ScoreInput = {
                key,
                answers,
            }

            props.onSubmit(score)
        }

    }, [props.questions.length, currentQuestionIndex, answers.length])

    const onClickReady = async () => {
        props.onClickReady()
    }

    React.useEffect(() => {
        if (props.score) {
            setTestState(TestState.Ended)
            dispatch('END')
        }
    }, [props.score])

    React.useEffect(() => {
        if (props.questions.length > 5) {
            setTestState(TestState.Ready)
            dispatch('READY')
        }
    }, [props.questions])

    const onClickStartTest = async () => {
        const key = await props.getKeyAsync()
        setTestState(TestState.Started)
        dispatch('START')
        setKey(key)
    }

    const onClickDetails = () => {
        setTestState(TestState.Details)
        dispatch('END.DETAILS')
    }

    const onClickScoreOverview = () => {
        setTestState(TestState.Ended)
        dispatch('END.OVERVIEW')
    }

    const onClickRestart = () => {
        setTestState(TestState.PreLoad)

        // Reset
        setCurrentQuestionIndex(0)
        setAnswers([])
    }

    const [currentAnswerReviewIndex, setCurrentAnswerIndexReview] = React.useState<number>(0)
    const currentAnswer = (props.score?.answers ?? [])[currentAnswerReviewIndex]
    const onClickPreviousAnswerReview = () => {
        setCurrentAnswerIndexReview(c => Math.max(0, c - 1))
    }

    const onClickAnswerReview = (answerIndex: number) => {
        setCurrentAnswerIndexReview(answerIndex)
    }

    const onClickNextAnswerReview = () => {
        const maxIndex = (props.score?.answers.length ?? 1) - 1
        setCurrentAnswerIndexReview(c => Math.min(maxIndex, c + 1))
    }

    const onClickLogIn = () => {
        loginWithRedirect()
    }

    const onChangeTestLevel = (testLevel: TestLevel) => {
        setTestLevel(testLevel)
    }

    if (isAuthenticated === false) {
        return (
            <div className={styles.test}>
                <div>
                    You must <button onClick={onClickLogIn}>log in</button> to take tests.
                </div>
            </div>
        )
    }

    if (testState === TestState.PreLoad) {
        return (
            <div className={styles.test}>
                <div>
                    <div>
                        <div className={styles.testLevelDescription}>
                            <TestLevelComponent
                                testLevel={testLevel}
                                onChange={onChangeTestLevel}
                            />
                        </div>
                        <div className={"center"}>
                            <button className={styles.testButton__Ready} onClick={onClickReady}>Ready</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (testState === TestState.Ready) {
        return (
            <div className={styles.test}>
                <div className={"center"}>
                    <button onClick={onClickStartTest}>Start</button>
                </div>
            </div>
        )
    }

    if (testState === TestState.Saving) {
        return (
            <div className={styles.test}>
                <div className={styles.testFinished}>
                    Saving...
                </div>
            </div>
        )
    }

    if (testState === TestState.Ended && props.score) {
        const correctAnswers = props.score.answers.filter(a => a.answerIndex === 1)
        const points = props.score.answers.reduce((s, a) => s + a.points, 0)
        const expectedPoints = props.score.answers.reduce((s, a) => s + a.expectedDuration, 0)

        return (
            <div className={styles.test}>
                <div className={styles.testFinished}>
                    <div className={styles.time}>⏰ Time: {props.score.duration / 1000}s</div>
                    <div className={styles.state}>
                        Finished!
                    </div>

                    <div className={styles.correctOutOfTotal}>
                        {correctAnswers.length}/{props.score.answers.length}
                    </div>
                    <div className={styles.correctList}>
                        {props.score.answers.map((a, i) => {
                            const marking = a.answerIndex === 1
                                ? '✔'
                                : '❌'

                            return (
                                <div key={i}>{marking}</div>
                            )
                        })}
                    </div>
                    <div>
                        Points: {points.toFixed(2)}
                    </div>
                    <div>
                        Expected Points: {expectedPoints.toFixed(2)}
                    </div>
                    <div>
                        <button type="button" className={styles.details} onClick={onClickDetails}>Details</button>
                    </div>
                    <div>
                        <button type="button" className={styles.restart} onClick={onClickRestart}>Restart</button>
                    </div>
                </div>
            </div>
        )
    }

    if (testState === TestState.Details && props.score) {
        const lastAnswerIndex = props.score.answers.length - 1
        return (
            <div className={styles.test}>
                <div className={styles.testDetails}>
                    <div className={styles.answerReviewButtons}>
                        <button
                            disabled={currentAnswerReviewIndex === 0}
                            onClick={onClickPreviousAnswerReview}
                        >
                            ◀ Prev
                        </button>
                        {props.score.answers.map((answer, answerIndex) => {
                            const marking = answer.answerIndex === 1
                                ? '✔'
                                : '❌'

                            const buttonHighlightClass = currentAnswerReviewIndex === answerIndex
                                ? styles.answerButtonHighlight
                                : ''

                            return (
                                <button key={answerIndex}
                                    onClick={() => onClickAnswerReview(answerIndex)}
                                    className={buttonHighlightClass}
                                >
                                    {marking}<br />
                                    {answerIndex + 1}
                                </button>
                            )
                        })}
                        <button
                            disabled={currentAnswerReviewIndex === lastAnswerIndex}
                            onClick={onClickNextAnswerReview}
                        >
                            Next ▶
                        </button>
                    </div>
                    {
                        currentAnswer &&
                        <AnswerDetails answerDetails={currentAnswer} />
                    }
                    <div className="center">
                        <button type="button" className={styles.details} onClick={onClickScoreOverview}>Score Overview</button>
                    </div>
                    <div className="center">
                        <button type="button" className={styles.restart} onClick={onClickRestart}>Restart</button>
                    </div>
                </div>
            </div>
        )
    }

    if (currentQuestion) {
        return (
            <div className={styles.test}>
                <div>Question:</div>
                <h2 className={styles.question}>{currentQuestion.question}</h2>

                <div className={styles.answers}>
                    <div>A1:</div>
                    <button onClick={onClick1}>{currentQuestion.answer1}</button>

                    <div>A2:</div>
                    <button onClick={onClick2}>{currentQuestion.answer2}</button>

                    <div>A3:</div>
                    <button onClick={onClick3}>{currentQuestion.answer3}</button>

                    <div>A4:</div>
                    <button onClick={onClick4}>{currentQuestion.answer4}</button>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.test}>
            <div className="center">
                Loading...
            </div>
        </div>
    )
}

type AnswerProps = {
    answerDetails: models.AnswerComputed
}

const AnswerDetails: React.FC<AnswerProps> = (props) => {
    const question = props.answerDetails.question
    const answers = [
        [question.answer1, question.details.percentageAnswer1],
        [question.answer2, question.details.percentageAnswer2],
        [question.answer3, question.details.percentageAnswer3],
        [question.answer4, question.details.percentageAnswer4],
    ]

    return (
        <div>
            <div className={styles.question}>{question.question}</div>
            <div className={styles.testAnswersReview}>
                {answers.map(([a, percentage], i) => {
                    let marking = ' '
                    if (i === 0) {
                        marking = '✔'
                    }
                    else if (i === props.answerDetails.answerIndex - 1) {
                        marking = '❌'
                    }

                    return <React.Fragment key={i}>
                        <div>{i + 1}</div>
                        <div>{a}</div>
                        <div>{marking}</div>
                        <div>{percentage}</div>
                    </React.Fragment>
                })}
            </div>

            <div className={styles.answerStats}>
                <div>Duration:</div><div>{props.answerDetails.duration}</div>
                <div>Expected Duration:</div><div>{props.answerDetails.expectedDuration}</div>
                <div>Average Duration:</div><div>{question.details.avgDuration}</div>
                <div>Points:</div><div>{props.answerDetails.points.toFixed(2)}</div>
            </div>
        </div>
    )
}

export default Component