import React from 'react'
import * as client from '../services/client'
import styles from "./Scores.module.css"
import classnames from "classnames"
import Score from "../components/Score"
import * as utils from "../utilities"
import * as models from "../models"

enum ScoreType {
    HighScores,
    MyScores,
}

const scoreTypeName: Record<ScoreType, string> = {
    [ScoreType.HighScores]: 'High',
    [ScoreType.MyScores]: 'My'
}

const Scores: React.FC = () => {
    const [scoreType, setScoreType] = React.useState(ScoreType.HighScores)
    const [scores, setScores] = React.useState<models.ScoreComputed[]>([])

    // React.useEffect(() => {

    // }, [scoreGroup])

    const onClickLoadScores = async () => {
        try {
            const scores = await client.getScores()
            const computedScores = scores.map(s => utils.computeDurationsOfScore(s))
            setScores(computedScores)
        } catch (error) {
            console.error(error)
        }
    }

    const isHighScoreActive = classnames({
        [styles.active]: scoreType === ScoreType.HighScores
    })

    const isMyScoreActive = classnames({
        [styles.active]: scoreType === ScoreType.MyScores
    })

    return (
        <div>
            <h1>{scoreTypeName[scoreType]} Scores</h1>
            <div className={styles.navigation}>
                <button className={isHighScoreActive} onClick={() => setScoreType(ScoreType.HighScores)}>
                    High Scores
                </button>
                <button className={isMyScoreActive} onClick={() => setScoreType(ScoreType.MyScores)}>
                    My Scores
                </button>
            </div>
            <div>
                <button onClick={onClickLoadScores}>
                    Load Scores
                </button>
            </div>
            {scores.length === 0
                ? <div>No Scores</div>
                : <div className={styles.scores}>
                    {scores.map(score =>
                        <Score score={score} key={score.id} />
                    )}
                </div>}
        </div>
    )
}

export default Scores
