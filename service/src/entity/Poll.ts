import * as TORM from "typeorm"
import { User } from './User'
import { Tag } from "./Tag"
import { PollDetails } from "./PollDetails"

export enum PollState {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

@TORM.Entity()
export class Poll {

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

    @TORM.Column({
        default: ''
    })
    revisionComment: string

    @TORM.Column({
        default: PollState.PENDING
    })
    state: string

    @TORM.ManyToOne(type => User, {
        eager: true,
        nullable: false,
    })
    user: User

    @TORM.OneToOne(type => PollDetails, {
        nullable: false,
    })
    @TORM.JoinColumn()
    details: PollDetails

    @TORM.ManyToMany(type => Tag, {
        eager: true,
        cascade: true,
        nullable: false,
    })
    @TORM.JoinTable()
    tags: Tag[]

    @TORM.CreateDateColumn()
    createdAt: Date

    @TORM.UpdateDateColumn()
    updatedAt: Date

    @TORM.VersionColumn()
    version: number
}
