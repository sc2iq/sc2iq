import React from 'react'
import * as models from '../../models'
import * as Auth0 from "../../react-auth0-spa"
import styles from "./Review.module.css"
import classnames from "classnames"
import { useSelector, useDispatch } from 'react-redux'
import * as QuestionsSlice from '../Questions/questionsSlice'
import * as PollsSlice from '../Polls/pollsSlice'
import Question from '../../components/Question'
import Poll from '../../components/Poll'
import ReviewItem from '../../components/ReviewItem'

enum ReviewState {
    Questions = 'Questions',
    Polls = 'Polls',
}

type Props = {
    view: ReviewState
    setView: (view: ReviewState) => void
    questions: models.Question[]
    polls: models.Poll[]
    onChangeQuestionState: (question: models.Question, state: models.QuestionState.APPROVED | models.QuestionState.REJECTED) => void
    onChangePollState: (poll: models.Poll, state: models.PollState.APPROVED | models.PollState.REJECTED) => void
}

const Review: React.FC<Props> = (props) => {

    const questionsActive = classnames({
        [styles.button]: true,
        [styles.active]: props.view === ReviewState.Questions
    })

    const pollsActive = classnames({
        [styles.button]: true,
        [styles.active]: props.view === ReviewState.Polls
    })

    const onClickQuestions = () => {
        props.setView(ReviewState.Questions)
    }

    const onClickPolls = () => {
        props.setView(ReviewState.Polls)
    }

    const filteredQuestions = props.questions.filter(q => q.state === "pending")
    const filteredPolls = props.polls.filter(p => p.state === "pending")

    return (
        <div>
            <h1>
                Review&nbsp;
                {props.view === ReviewState.Questions
                    && 'Questions'}

                {props.view === ReviewState.Polls
                    && 'Polls'}
            </h1>

            <div className={styles.tabs}>
                <button className={questionsActive} onClick={onClickQuestions}>Questions</button>
                <button className={pollsActive} onClick={onClickPolls}>Polls</button>
            </div>

            <div className={styles.reviewItems}>
                {props.view === ReviewState.Questions
                    && (filteredQuestions.length === 0
                        ? <div>
                            <div>No Questions to Review</div>
                        </div>
                        : <div className="list">
                            {filteredQuestions.map((question, i) =>
                                <ReviewItem
                                    key={question.id}
                                    onApprove={() => props.onChangeQuestionState(question, models.QuestionState.APPROVED)}
                                    onReject={() => props.onChangeQuestionState(question, models.QuestionState.REJECTED)}
                                >
                                    <Question
                                        question={question}
                                        index={i}
                                    />
                                </ReviewItem>
                            )}
                        </div>
                    )}


                {props.view === ReviewState.Polls
                    && (filteredPolls.length === 0
                        ? <div>
                            <div>No Polls to Review</div>
                        </div>
                        : <div className="list">
                            {filteredPolls.map((poll, i) =>
                                <ReviewItem
                                    key={poll.id}
                                    onApprove={() => props.onChangePollState(poll, models.PollState.APPROVED)}
                                    onReject={() => props.onChangePollState(poll, models.PollState.REJECTED)}
                                >
                                    <Poll
                                        poll={poll}
                                        index={i}
                                    />
                                </ReviewItem>
                            )}
                        </div>
                    )}
            </div>
        </div>
    )
}

const ReviewContainer: React.FC = () => {
    const { getTokenSilently } = Auth0.useAuth0()
    const [view, setView] = React.useState(ReviewState.Questions)
    const questionsState = useSelector(QuestionsSlice.selectQuestions)
    const pollsState = useSelector(PollsSlice.selectPolls)
    const dispatch = useDispatch()

    React.useEffect(() => {
        async function loadQuestions() {
            dispatch(QuestionsSlice.getQuestionsThunk(models.QuestionState.PENDING))
        }

        async function loadPolls() {
            dispatch(PollsSlice.getPollsThunk(models.PollState.PENDING))
        }

        if (view === ReviewState.Questions && questionsState.questions.length === 0) {
            loadQuestions()
        }
        if (view === ReviewState.Polls && pollsState.polls.length === 0) {
            loadPolls()
        }
    }, [dispatch, view, questionsState.questions.length, pollsState.polls.length])

    const onChangeQuestionState = async (question: models.Question, state: models.QuestionState.APPROVED | models.QuestionState.REJECTED) => {
        const token = await getTokenSilently()
        dispatch(QuestionsSlice.setQuestionStateThunk(token, question.id, state))
    }

    const onChangePollState = async (poll: models.Poll, state: models.PollState.APPROVED | models.PollState.REJECTED) => {
        const token = await getTokenSilently()
        dispatch(PollsSlice.setPollStateThunk(token, poll.id, state))
    }

    return (
        <Review
            view={view}
            setView={setView}
            questions={questionsState.questions}
            polls={pollsState.polls}
            onChangeQuestionState={onChangeQuestionState}
            onChangePollState={onChangePollState}
        />
    )
}

export default ReviewContainer