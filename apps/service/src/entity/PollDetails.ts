import { Entity, PrimaryGeneratedColumn, Column, OneToOne, UpdateDateColumn, VersionColumn } from "typeorm"
import { Poll } from './Poll'

@Entity()
export class PollDetails {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @OneToOne(type => Poll, poll => poll.id)
    pollId: string

    // @Column({
    //     default: 0.0,
    // })
    // avgDuration: number
    
    @Column({
        default: 0.0,
    })
    answer1count: number

    @Column({
        default: 0.0,
    })
    answer2count: number

    @Column({
        default: 0.0,
    })
    answer3count: number

    @Column({
        default: 0.0,
    })
    answer4count: number

    @UpdateDateColumn()
    updatedAt: Date

    @VersionColumn()
    version: number
}
