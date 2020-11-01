import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Score } from './Score'
import { Question } from "./Question"

@Entity()
export class Answer {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column('datetime2')
    submittedAt: Date

    @Column("decimal")
    points: number

    @Column("decimal")
    expectedDuration: number

    @Column()
    answerIndex: number

    @ManyToOne(type => Question, question => question.id, {
        eager: true,
        nullable: false,
    })
    question: Question

    @ManyToOne(type => Score, score => score.answers)
    score: Score
}
