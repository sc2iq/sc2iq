import React from 'react'
import * as Auth0 from "../react-auth0-spa"
import * as models from '../models'
import { useEventListener } from '../hooks/useEventListener'
import styles from './Test.module.css'
import TestLevelComponent, { TestLevel } from './TestLevel'
import { Machine } from 'xstate'
import { useMachine } from '@xstate/react'
import * as client from '../services/client'
import * as util from '../utilities'

type TestEvent =
    | { type: 'LOAD' }
    | { type: 'START' }
    | { type: 'END' }
    | { type: 'DETAILS' }
    | { type: 'OVERVIEW' }
    | { type: 'RESTART' }

type TestContext =
    | {
        value: 'preload'
    }
    | {
        value: 'loading'
    }
    | {
        value: 'ready',
        questions: models.Question[],
    }
    | {
        value: 'started',
        key: string | undefined,
        questions: models.Question[],
    }
    | {
        value: 'ended'
    }
    | {
        type: 'done.invoke.loadQuestions',
        questions: models.Question[]
    }

const testStateMachine = Machine({
    id: 'testState',
    strict: true,
    initial: 'preload',
    context: {
        key: '',
        questions: [] as models.Question[],
        score: undefined as (models.ScoreComputed | undefined),
        answers: [] as models.AnswerInput[],
    },
    states: {
        preload: {
            entry: 'resetContext',
            on: {
                LOAD: {
                    target: 'loading',
                },
            },
        },
        loading: {
            invoke: {
                src: 'loadQuestions',
                onDone: {
                    target: 'ready',
                    actions: ['saveQuestions']
                },
            },
        },
        ready: {
            on: {
                START: {
                    target: 'starting',
                },
            }
        },
        starting: {
            invoke: {
                src: 'getKey',
                onDone: {
                    target: 'started',
                    actions: ['setKey']
                }
            }
        },
        started: {
            on: {
                ADD_ANSWER: [
                    {
                        target: 'started',
                        cond: (context: any, event: any) => {
                            return context.answers.length < context.questions.length - 1
                        },
                        actions: ['addAnswer']
                    },
                    {
                        target: 'saving',
                        actions: ['addAnswer']
                    }
                ]
            }
        },
        saving: {
            invoke: {
                src: 'submitScore',
                onDone: {
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
    },
},
    {
        services: {
            loadQuestions: async (context, event) => {
                const questions = await client.getRandomQuestions()
                return questions.slice(0, 10)
            },
            getKey: async (context, event) => {
                const key = await client.getKey()
                return key
            },
        },
        actions: {
            saveQuestions: (context, event) => {
                context.questions = event.data
            },
            setKey: (context, event) => {
                context.key = event.data
            },
            setScore: (context, event) => {
                context.score = event.data
            },
            addAnswer: (context, event) => {
                context.answers.push(event.answer)
            },
            resetContext: (context) => {
                context.questions = []
                context.key = ''
                context.score = undefined
                context.answers = []
            }
        }
    })

type Props = {
}

const Component: React.FC<Props> = (props) => {
    const { getTokenSilently } = Auth0.useAuth0()
    const submitScore = React.useCallback(async (context, event) => {
        const token = await getTokenSilently()
        const scoreInput: models.ScoreInput = {
            key: testState.context.key,
            answers: testState.context.answers,
        }

        const score = await client.postScore(token, scoreInput)
        const scoreComputed = util.computeDurationsOfScore(score)
        context.score = scoreComputed
        return scoreComputed
    }, [])

    // Use State machine to manage test states
    const [testState, send, service] = useMachine(testStateMachine, {
        services: {
            submitScore,
        }
    })

    React.useEffect(() => {
        service.onEvent(event => {
            console.log(`Event:  `, event.type, event)
        })

        const subscription = service.subscribe((state) => {
            console.log(`State: `, state.value, state.context)
        })

        return subscription.unsubscribe
    }, [service])

    const { isAuthenticated, loginWithRedirect } = Auth0.useAuth0()
    const [testLevel, setTestLevel] = React.useState(TestLevel.Easy)
    const currentQuestion = testState.context.questions[testState.context.answers.length]

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

        send({ type: 'ADD_ANSWER', answer })
    }

    const onClick1 = onClickAnswer(1)
    const onClick2 = onClickAnswer(2)
    const onClick3 = onClickAnswer(3)
    const onClick4 = onClickAnswer(4)

    const keyDownListener = (event: KeyboardEvent) => {
        if (testState.matches('preload') === true) {
            switch (event.key) {
                case "Enter": {
                    onClickReady()
                    break
                }
            }
        }
        else if (testState.matches('ready') === true) {
            switch (event.key) {
                case "Enter": {
                    onClickStartTest()
                    break
                }
            }
        }
        else if (testState.matches('started') === true) {
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
        else if (testState.matches('ended.overview') === true) {
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
        else if (testState.matches('ended.details') === true) {
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

    useEventListener('keydown', keyDownListener, document)


    const onClickReady = async () => {
        send({ type: 'LOAD' })
    }

    const onClickStartTest = async () => {
        send({ type: 'START' })
    }

    const onClickDetails = () => {
        send({ type: 'DETAILS' })
    }

    const onClickScoreOverview = () => {
        send({ type: 'OVERVIEW' })
    }

    const onClickRestart = () => {
        send({ type: 'RESTART' })
    }

    const [currentAnswerReviewIndex, setCurrentAnswerIndexReview] = React.useState<number>(0)
    const currentAnswer = (testState.context.score?.answers ?? [])[currentAnswerReviewIndex]
    const onClickPreviousAnswerReview = () => {
        setCurrentAnswerIndexReview(c => Math.max(0, c - 1))
    }

    const onClickAnswerReview = (answerIndex: number) => {
        setCurrentAnswerIndexReview(answerIndex)
    }

    const onClickNextAnswerReview = () => {
        const maxIndex = (testState.context.score?.answers.length ?? 1) - 1
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

    if (testState.matches('preload') === true) {
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

    if (testState.matches('loading') === true) {
        return (
            <div className={styles.test}>
                <div className={"center"}>
                    Loading Questions...
                </div>
            </div>
        )
    }

    if (testState.matches('ready') === true) {
        return (
            <div className={styles.test}>
                <div className={"center"}>
                    <button onClick={onClickStartTest}>Start</button>
                </div>
            </div>
        )
    }

    if (testState.matches('starting') === true) {
        return (
            <div className={styles.test}>
                <div className={"center"}>
                    Starting...
                </div>
            </div>
        )
    }

    if (testState.matches('started') === true && currentQuestion) {
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

    if (testState.matches('saving') === true) {
        return (
            <div className={styles.test}>
                <div className={styles.testFinished}>
                    Saving...
                </div>
            </div>
        )
    }

    if (testState.matches('ended') === true && testState.context.score) {
        const score = testState.context.score
        if (testState.matches('ended.overview') === true) {
            const correctAnswers = score.answers.filter(a => a.answerIndex === 1)
            const points = score.answers.reduce((s, a) => s + a.points, 0)
            const expectedPoints = score.answers.reduce((s, a) => s + a.expectedDuration, 0)

            return (
                <div className={styles.test}>
                    <div className={styles.testFinished}>
                        <div className={styles.time}>⏰ Time: {score.duration / 1000}s</div>
                        <div className={styles.state}>
                            Finished!
                    </div>

                        <div className={styles.correctOutOfTotal}>
                            {correctAnswers.length}/{score.answers.length}
                        </div>
                        <div className={styles.correctList}>
                            {score.answers.map((a, i) => {
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

        if (testState.matches('ended.details') === true) {
            const lastAnswerIndex = score.answers.length - 1
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
                            {score.answers.map((answer, answerIndex) => {
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
    }

    return (
        <div className={styles.test}>
            <div className="center">
                🚨 Unknown State {testState.value} 🚨
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
        [question.answer1, question.details.answer1count],
        [question.answer2, question.details.answer2count],
        [question.answer3, question.details.answer3count],
        [question.answer4, question.details.answer4count],
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