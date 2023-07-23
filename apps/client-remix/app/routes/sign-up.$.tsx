import { SignUp } from "@clerk/remix"

export default function SignUpRoute() {
    return (
        <div>
            <h1>Sign Up route</h1>
            <SignUp routing={"path"} path={"/sign-up"} />
        </div>
    )
}
