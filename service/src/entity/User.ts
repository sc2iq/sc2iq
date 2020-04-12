import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm"
import { Score } from './Score'
import { Question } from "./Question"

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive'
}

@Entity()
export class User {

    @PrimaryColumn()
    id: string

    @Column()
    name: string

    @Column({
        default: 1.00
    })
    reputation: number

    @Column({
        default: UserStatus.ACTIVE
    })
    status: string

    @Column({
        default: 0
    })
    points: number

    // Relations
    @OneToMany(type => Score, score => score.user)
    scores: Score[]

    @OneToMany(type => Question, question => question.user)
    questions: Question[]
}
