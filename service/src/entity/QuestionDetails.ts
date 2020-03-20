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
    percentageAnswer1: number

    @Column({
        default: 0.0,
    })
    percentageAnswer2: number

    @Column({
        default: 0.0,
    })
    percentageAnswer3: number

    @Column({
        default: 0.0,
    })
    percentageAnswer4: number

    @UpdateDateColumn()
    updatedAt: Date

    @VersionColumn()
    version: number
}
