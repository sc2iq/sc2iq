import React from "react"
import * as models from "../models"
import styles from "./UserBanner.module.css"

type Props = {
    user: models.User
}

enum League {
    Silver = 'Silver',
    Gold = 'Gold',
    Platinum = 'Platinum',
    Diamond = 'Diamond',
    Masters = 'Masters',
    GM = 'GM',
}

// Number is when league stops
const leagueBoundaries: [League, number][] = [
    [League.Silver, 0],
    [League.Gold, 2],
    [League.Platinum, 3],
    [League.Diamond, 5],
    [League.Masters, 7],
    [League.GM, 9],
]

function getLeague(difficultyRating: number): League {
    const boundary = leagueBoundaries.find(([name, boundary]) => difficultyRating < boundary)!
    const [league] = boundary
    return league
}

type BarProps = {
    min: number
    value: number
    max: number
}

const DifficultyBar: React.FC<BarProps> = (props) => {
    if (props.min > props.max) {
        throw new Error(`Minimum value ${props.min} must not be greater than the max ${props.max}`)
    }

    const percentage = Math.max(0, props.value - props.min) / (props.max - props.min)
    const displayPercentage = (percentage * 100).toFixed(0)
    console.log({ props, percentage })

    const style = {
        flex: `${percentage}`,
    }

    return (
        <div className={styles.difficulty}>
            <div>{props.min}</div>
            <div className={styles.difficultyBar}>
                <div className={styles.difficultyBarMeter} style={style}></div>
            </div>
            <div>{props.max} ({displayPercentage}%)</div>
        </div>
    )
}

const UserBanner: React.FC<Props> = (props) => {
    // TODO: Base off difficulty rating
    const league = getLeague(props.user.reputation)
    const leaguePercentage = 65.7

    return (
        <div className={styles.userBanner}>
            <div>League: {league}</div>
            <DifficultyBar
                min={1}
                value={1.34}
                max={2}
            />
            <div>Points: {props.user.points}</div>
            <div>Reputation: {props.user.reputation}</div>
        </div>
    )
}

export default UserBanner