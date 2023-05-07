import { Question } from "@prisma/client"

type Props = {
  // TODO: Find way to use SerializeObject<UndefinedToOptional<Question>>
  question: Omit<Question, 'createdAt' | 'updatedAt'> & { createdAt: string, updatedAt: string }
}

export default function Component(props: Props) {
  return (
    <div>
      <h2>Question: {props.question.question}</h2>
      <div>Answer 1: {props.question.answer1}</div>
      <div>Answer 2: {props.question.answer2}</div>
      <div>Answer 3: {props.question.answer3}</div>
      <div>Answer 4: {props.question.answer4}</div>
      <div>Difficulty: {props.question.difficulty}</div>
      <div>Tags: []</div>
    </div>
  )
}
