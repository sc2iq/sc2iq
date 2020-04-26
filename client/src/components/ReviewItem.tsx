import React from "react"
import styles from "./ReviewItem.module.css"

type Props = {
    onApprove: () => void
    onReject: () => void
}

const ReviewItem: React.FC<Props> = (props) => {
    return (
        <div className={styles.reviewItem}>
            <div>
                {props.children}
            </div>
            <div className={styles.approveReject}>
                <button className={styles.approveButton} onClick={props.onApprove}>✔ Approve</button>
                <button className={styles.rejectButton} onClick={props.onReject}>❌ Reject</button>
            </div>
        </div>
    )
}

export default ReviewItem