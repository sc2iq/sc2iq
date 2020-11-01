import { Entity, PrimaryGeneratedColumn, Column, OneToOne, UpdateDateColumn, VersionColumn } from "typeorm"
import { Question } from './Question'

@Entity()
export class QuestionDetails {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @OneToOne(type => Question, question => question.id)
    questionId: string

    @Column({
        default: 0.0,
    })
    avgDuration: number

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
