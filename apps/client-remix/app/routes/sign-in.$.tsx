import { SignIn } from "@clerk/remix"

export default function SignInRoute() {
  return (
    <div  className="flex flex-row justify-center">
      <SignIn routing={"path"} path={"/sign-in"} />
    </div>
  )
}
