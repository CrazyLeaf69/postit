import Link from "next/link";
import { Icons } from "./Icons";
import UserAuthForm from "./UserAuthForm";
import { FC } from "react";

interface Props {
  isSignUp?: boolean;
}

const SignIn: FC<Props> = ({ isSignUp = false }) => {
  return (
    <div className="containter mx-auto flex w-fuöö flex-col justify-center space-y-6 sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <Icons.logo className="mx-auto h-6 w-6" />
        <h1 className="text-2xl font-semibold tracking-tight">{isSignUp ? "Sign Up" : "Welcome back"}</h1>
        <p className="text-sm max-w-xs mx-auto">
          By continuing, you are setting up a Postit account and agree to our User Agreement and Privacy Policy
        </p>
        {/* sign in form */}
        <UserAuthForm />
        <p className="px-8 text-center text-sm text-zinc-700">
          {isSignUp ? "Already a Poster?" : "New to Postit?"}{" "}
          <Link
            href={isSignUp ? "/sign-in" : "/sign-up"}
            className="hover:text-zinc-800 text-sm underline underline-offset-4"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
