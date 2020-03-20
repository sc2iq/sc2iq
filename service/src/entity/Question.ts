import * as TORM from "typeorm"
import { User } from './User'
import { Tag } from "./Tag"
import { QuestionDetails } from "./QuestionDetails"

export enum QuestionStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

@TORM.Entity()
export class Question {

    @TORM.PrimaryGeneratedColumn("uuid")
    id: string

    @TORM.Index({ fulltext: true })
    @TORM.Column()
    question: string

    @TORM.Column()
    answer1: string

    @TORM.Column()
    answer2: string

    @TORM.Column()
    answer3: string

    @TORM.Column()
    answer4: string

    @TORM.Column()
    difficulty: number

    @TORM.Column({
        default: ''
    })
    revisionComment: string

    @TORM.Column({
        default: QuestionStatus.PENDING
    })
    state: string

    @TORM.ManyToOne(type => User, {
        eager: true,
        nullable: false,
    })
    user: User

    @TORM.OneToOne(type => QuestionDetails, {
        nullable: false,
    })
    @TORM.JoinColumn()
    details: QuestionDetails

    @TORM.ManyToMany(type => Tag, {
        eager: true,
        cascade: true,
        nullable: false,
    })
    @TORM.JoinTable()
    tags: Tag[]

    @TORM.Column()
    source: string

    @TORM.CreateDateColumn()
    createdAt: Date

    @TORM.UpdateDateColumn()
    updatedAt: Date

    @TORM.VersionColumn()
    version: number
}
