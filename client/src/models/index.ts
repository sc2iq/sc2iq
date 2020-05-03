export type Entity = {
    createdAt: number
    updatedAt: string
    version: number
}

export type AnswerInput = {
    submittedAt: string
    questionId: string
    answerIndex: number
}

export type ScoreInput = {
    key: string
    answers: AnswerInput[]
}

export type Answer = {
    submittedAt: string
    answerIndex: number
    expectedDuration: number
    points: number
    question: QuestionWithDetails
}

export type Score
    = {
        answers: Answer[]
        startedAt: string
        id: string
        user: User
    }

export type AnswerComputed
    = Answer
    & {
        duration: number
    }

export type ScoreComputed
    = Omit<Score, 'answers'>
    & {
        avgDifficulty: number
        points: number
        duration: number
        answers: AnswerComputed[]
    }

export type Tag = {
    id: string
    name: string
}


export type PollInput = {
    question: string
    answer1: string
    answer2: string
    answer3: string
    answer4: string
    tags: string[]
}

export enum PollState {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export type Poll
    = Omit<PollInput, 'tags'>
    & Entity
    & {
        id: string
        revisionComment: string
        state: string
        user: User
        tags: Tag[]
    }

export type PollDetails = {
    totalVotes: number
    votesAnswer1: number
    votesAnswer2: number
    votesAnswer3: number
    votesAnswer4: number
    updatedAt: string
}

export type PollWithDetails
    = Poll
    & { details: PollDetails }

export type QuestionInput = {
    question: string
    answer1: string
    answer2: string
    answer3: string
    answer4: string
    difficulty: number
    source: string
    tags: string[]
}

export type QuestionDetails = {
    avgDuration: number
    percentageAnswer1: number
    percentageAnswer2: number
    percentageAnswer3: number
    percentageAnswer4: number
    updatedAt: string
}

export enum QuestionState {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export type Question
    = Omit<QuestionInput, 'tags'>
    & Entity
    & {
        id: string
        revisionComment: string
        state: QuestionState
        user: User
        tags: Tag[]
        details?: QuestionDetails
    }

export type QuestionWithDetails
    = Question
    & { details: QuestionDetails }

export type UserInput = {
    id: string
    name: string
}

export type UserMetadata = {
    reputation: number
    points: number
    status: string
    difficultyRating: number
}

export type User
    = UserInput
    & UserMetadata
    & {
        scores: Score[]
        questions: Question[]
    }

export type Search
    = {
        phrase: string,
        tags: string[],
        minDifficulty: number,
        maxDifficulty: number,
    }

export type AccessToken = {
    iss: string
    sub: string
    aud: string[]
    iat: number
    exp: number
    azp: string
    scope: string
    permissions: string[]
}