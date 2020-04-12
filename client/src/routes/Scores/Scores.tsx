import React from 'react'
import * as Auth0 from "../../react-auth0-spa"
import * as client from '../../services/client'
import * as models from '../../models'
import styles from "./Scores.module.css"
import classnames from "classnames"
import Score from "../../components/Score"
import * as utils from "../../utilities"
import { useSelector, useDispatch } from 'react-redux'
import * as ScoresSlice from './scoresSlice'

enum ScoreType {
    HighScores,
    MyScores,
}

const scoreTypeName: Record<ScoreType, string> = {
    [ScoreType.HighScores]: 'High',
    [ScoreType.MyScores]: 'My'
}

type Props = {
    scores: models.ScoreComputed[] 
    getScoresAsync: () => Promise<void>
    postScoreAsync: (scoreInput: models.ScoreInput) => Promise<void>
}

const Scores: React.FC<Props> = (props) => {
    const [scoreType, setScoreType] = React.useState(ScoreType.HighScores)

    const onClickLoadScores = async () => {
        console.log(`onClickLoadScores`)
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
            {props.scores.length === 0
                ? <div>No Scores</div>
                : <div className={styles.scores}>
                    {props.scores.map(score =>
                        <Score score={score} key={score.id} />
                    )}
                </div>}
        </div>
    )
}

const ScoresContainer: React.FC = () => {
    const state = useSelector(ScoresSlice.selectScores)
    const dispatch = useDispatch()
    const { getTokenSilently } = Auth0.useAuth0()

    React.useEffect(() => {
        async function loadScores() {
            dispatch(ScoresSlice.getScoresThunk())
        }

        if (state.scores.length === 0) {
            loadScores()
        }
    }, [])

    const getScoresAsync = async () => {
        ScoresSlice.getScoresThunk()
    }

    const postScoreAsync = async (score: models.ScoreInput) => {
        const token = await getTokenSilently()
        ScoresSlice.postScoreThunk(token, score)
    }

    return (
        <Scores
            scores={state.scores}
            getScoresAsync={getScoresAsync}
            postScoreAsync={postScoreAsync}
        />
    )
}

export default ScoresContainer