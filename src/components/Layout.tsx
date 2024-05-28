import React from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { type PropsWithChildren } from "react";

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div className=" flex h-screen w-screen flex-col">
      <div className="flex h-10 items-center justify-end px-2">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="rounded bg-blue-500 px-4 py-1 font-bold text-white hover:bg-blue-700">
              Sign in
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
      {children}
    </div>
  );
};
export default Layout;
