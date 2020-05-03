import React from "react"
import * as RRD from 'react-router-dom'
import * as models from "../models"
import styles from './Question.module.css'
import * as client from "../services/client"

type Props = {
    question: models.Question
    index?: number
}

const Question: React.FC<Props> = ({ question, index }) => {
    const [details, setDetails] = React.useState<models.QuestionDetails>()

    const onClickLoadDetails = async () => {
        const questionWithDetails = await client.getQuestion(question.id)
        setDetails(questionWithDetails.details)
    }

    const number = typeof index === 'number'
        ? `${(index + 1).toString().padStart(3, '0')} `
        : ''

    return (
        <div className={styles.question}>
            <div className={styles.title}>
                {number}{question.question}
            </div>
            <div className={styles.answers}>
                <div>{question.answer1}</div>
                <div>{question.answer2}</div>
                <div>{question.answer3}</div>
                <div>{question.answer4}</div>
            </div>
            <div>
                <dl>
                    <dt>Tags</dt>
                    <dd>{question.tags.map(t => <span className={styles.tag} key={t.id}>{t.name}</span>)}</dd>
                    <dt>State:</dt>
                    <dd>{question.state}</dd>
                    <dt>Author</dt>
                    <dd>{question.user.name}</dd>
                    <dt>Difficulty</dt>
                    <dd>{question.difficulty}</dd>
                    <dt>Avg. Correct</dt>
                    <dd>79%</dd>
                    <dt>Source:</dt>
                    <dd>{question.source}</dd>
                </dl>
            </div>
            <div>
                Disagree with the question? Submit a change request: <button>Submit Change</button>
            </div>
            <div>
            
                <RRD.NavLink to={`/questions/${question.id}`} >Direct Link</RRD.NavLink>
            </div>
            <div>
                <button type="button" onClick={onClickLoadDetails}>Load Details</button>
                {details && JSON.stringify(details, null, 4)}
            </div>
        </div>
    )
}

export default Question