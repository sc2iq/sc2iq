import { Poll } from "@prisma/client"

type Props = {
  // TODO: Find way to use SerializeObject<UndefinedToOptional<Poll>>
  poll: Omit<Poll, 'createdAt' | 'updatedAt'> & { createdAt: string, updatedAt: string }
}

export default function Component(props: Props) {
  return (
    <div>
      <h2>Poll: {props.poll.question}</h2>
      <div>Answer 1: {props.poll.answer1}</div>
      <div>Answer 2: {props.poll.answer2}</div>
      <div>Answer 3: {props.poll.answer3}</div>
      <div>Answer 4: {props.poll.answer4}</div>
      <div>Tags: []</div>
    </div>
  )
}
