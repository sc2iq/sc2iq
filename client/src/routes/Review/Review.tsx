import React from 'react'
import * as models from '../../models'
import styles from "./Review.module.css"
import classnames from "classnames"
import { useSelector, useDispatch } from 'react-redux'
import * as QuestionsSlice from '../Questions/questionsSlice'
import * as PollsSlice from '../Polls/pollsSlice'
import Question from '../../components/Question'
import Poll from '../../components/Poll'

enum ReviewState {
    Questions = 'Questions',
    Polls = 'Polls',
}

type Props = {
    view: ReviewState
    setView: (view: ReviewState) => void
    questions: models.Question[]
    polls: models.Poll[]
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
                        : filteredQuestions.map((question, i) =>
                            <div key={question.id}>{i.toString().padStart(3, ' ')}: <Question question={question} /></div>
                        ))}

                {props.view === ReviewState.Polls
                    && (filteredPolls.length === 0
                        ? <div>
                            <div>No Polls to Review</div>
                        </div>
                        : filteredPolls.map((poll, i) =>
                            <div key={poll.id}>{i.toString().padStart(3, ' ')}: <Poll poll={poll} /></div>
                        ))}
            </div>
        </div>
    )
}

const ReviewContainer: React.FC = () => {
    const [view, setView] = React.useState(ReviewState.Questions)
    const questionsState = useSelector(QuestionsSlice.selectQuestions)
    const pollsState = useSelector(PollsSlice.selectPolls)
    const dispatch = useDispatch()

    React.useEffect(() => {
        async function loadQuestions() {
            dispatch(QuestionsSlice.getQuestionsThunk())
        }

        async function loadPolls() {
            dispatch(PollsSlice.getPollsThunk())
        }

        if (view === ReviewState.Questions && questionsState.questions.length === 0) {
            loadQuestions()
        }
        if (view === ReviewState.Polls && pollsState.polls.length === 0) {
            loadPolls()
        }
    }, [view])

    return (
        <Review
            view={view}
            setView={setView}
            questions={questionsState.questions}
            polls={pollsState.polls}
        />
    )
}

export default ReviewContainer