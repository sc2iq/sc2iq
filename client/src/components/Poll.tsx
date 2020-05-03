import React from "react"
import * as RRD from 'react-router-dom'
import * as models from "../models"
import styles from './Question.module.css'
import * as client from "../services/client"

type Props = {
    poll: models.Poll
    index?: number
}

const Poll: React.FC<Props> = ({ poll, index }) => {

    const [details, setDetails] = React.useState<models.PollDetails>()

    const onClickLoadDetails = async () => {
        const pollWithDetails = await client.getPoll(poll.id)
        setDetails(pollWithDetails.details)
    }

    const number = typeof index === 'number'
        ? `${(index + 1).toString().padStart(3, '0')} `
        : ''

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