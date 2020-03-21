import React from "react"
import * as models from "../models"
import styles from "./Score.module.css"

type Props = {
    score: models.ScoreComputed
}

const Score: React.FC<Props> = ({ score }) => {

    return (
        <div className={styles.score}>
            <div>{score.user.name}</div>
            <div>{score.avgDifficulty}</div>
            <div>{score.duration}</div>
            <div>{score.points}</div>
        </div>
    )
}

export default Score