import React from "react"
import * as models from "../models"
import styles from './Question.module.css'
import * as client from "../services/client"

type Props = {
    poll: models.Poll
}

const Poll: React.FC<Props> = ({ poll }) => {
    
    const [details, setDetails] = React.useState<models.PollDetails>()

    const onClickLoadDetails = async () => {
        const pollWithDetails = await client.getPoll(poll.id)
        setDetails(pollWithDetails.details)
    }

    return (
        <div className={styles.question}>
            <div className={styles.title}>
                {poll.question}
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
                Disagree with the question? Submit a change request: <button>Submit Change</button>
            </div>
            <div>
                <button type="button" onClick={onClickLoadDetails}>Load Details</button>
                {details && JSON.stringify(details, null, 4)}
            </div>
        </div>
    )
}

export default Poll