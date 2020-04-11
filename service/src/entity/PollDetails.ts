import { Entity, PrimaryGeneratedColumn, Column, OneToOne, UpdateDateColumn, VersionColumn } from "typeorm"
import { Poll } from './Poll'

@Entity()
export class PollDetails {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @OneToOne(type => Poll, poll => poll.id)
    pollId: string

    @Column({
        default: 0.0,
    })
    totalVotes: number

    @Column({
        default: 0.0,
    })
    votesAnswer1: number

    @Column({
        default: 0.0,
    })
    votesAnswer2: number

    @Column({
        default: 0.0,
    })
    votesAnswer3: number

    @Column({
        default: 0.0,
    })
    votesAnswer4: number

    @UpdateDateColumn()
    updatedAt: Date

    @VersionColumn()
    version: number
}
