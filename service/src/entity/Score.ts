import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm"
import { Answer } from "./Answer"
import { User } from "./User"

@Entity()
export class Score {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column('datetime2')
    startedAt: Date

    @OneToMany(type => Answer, answer => answer.score, {
        cascade: true,
        eager: true,
        nullable: false,
    })
    answers: Answer[]

    @ManyToOne(type => User, user => user.scores, {
        eager: true,
        nullable: false,
    })
    user: User
}
