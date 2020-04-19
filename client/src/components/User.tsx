import React from "react"
import * as models from "../models"
import styles from "./User.module.css"

type Props = {
    user: models.User
}

const User: React.FC<Props> = ({ user }) => {
    return (
        <div className={styles.user}>
            <div>{user.name}</div>
            <div>{user.difficultyRating}</div>
            <div>{user.points}</div>
            <div>{user.reputation}</div>
            <div>{user.status}</div>
        </div>
    )
}

export default User