import React from "react"
import * as RRD from "react-router-dom"
import * as models from "../models"
import styles from "./Score.module.css"

type Props = {
    score: models.ScoreComputed
}

const Score: React.FC<Props> = ({ score }) => {
    const [isOpen, setIsOpen] = React.useState(false)

    const onClickHeader = () => {
        setIsOpen(x => !x)
    }

    return (
        <div>
            <div className={`${styles.scoreRow} ${isOpen ? styles.open : ''}`} onClick={onClickHeader}>
                <div><RRD.NavLink to={`/users/${score.user.id}`}>{score.user.name}</RRD.NavLink></div>
                <div>{score.avgDifficulty}</div>
                <div>{score.duration}</div>
                <div>{score.points}</div>
                {/* <div>{score.difficultyChange}</div> */}
                <div>+0.23</div>
            </div>
            {isOpen
                && (
                    <>
                    <div className={styles.answerRows}>
                        <div>📰 Question</div>
                        <div>📝 Answer</div>
                        <div>⚖ Difficulty</div>
                        <div>⌚ Duration</div>
                        <div>🎉 Points</div>
                        <div>Correct</div>

                        {score.answers.map((answer, i) => {
                            const chosenAnswer = [
                                answer.question.answer1,
                                answer.question.answer2,
                                answer.question.answer3,
                                answer.question.answer4,
                            ][answer.answerIndex - 1]

                            if (!chosenAnswer) {
                                throw new Error(`Score could not find answer index: ${answer.answerIndex} from question: ${answer.question}`)
                            }
                            return (
                                <React.Fragment key={i}>
                                    <div>{answer.question.question}</div>
                                    <div>{chosenAnswer}</div>
                                    <div>{answer.question.difficulty}</div>
                                    <div>{answer.duration / 1000} s</div>
                                    <div>{answer.points} pts</div>
                                    <div>{answer.answerIndex === 1
                                        ? '✔' : '❌'}</div>
                                </React.Fragment>
                            )
                        })}
                    </div>

                    </>
                )}
        </div>
    )
}

export default Score