import React from "react"
import * as models from "../models"
import styles from "./User.module.css"

type Props = {
    user: models.UserMetadata
}

const User: React.FC<Props> = ({ user }) => {
    return (
        <div className={styles.user}>
            <div>Name: {user.name}</div>
            <div>Points: {user.points}</div>
        </div>
    )
}

export default User