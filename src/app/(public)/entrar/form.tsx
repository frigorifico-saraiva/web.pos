"use client";

import { useActionState } from "react";
import { getTokenAction, TokenActionState } from "@/lib/api/actions/auth";
import { InputField } from "@/components/inputField";

export default function LoginForm() {
  const [state, action, pending] = useActionState<TokenActionState, FormData>(
    getTokenAction,
    null,
  );

  return (
    <form action={action} className="w-full max-w-xl mt-20">
      <p className="text-start text-lg font-light">entre na sua conta</p>

      <InputField
        label="usuário"
        name="username"
        type="text"
        autoCapitalize="none"
        autoCorrect="off"
        required
      />

      <InputField label="senha" name="password" type="password" required />

      <div className="mt-1 relative h-5">
        {state && "error" in state && (
          <p className="text-end text-xs font-light text-red-500">
            {state.message}
          </p>
        )}
      </div>

      <div className="flex justify-center items-center w-full px-2 border py-0.5 cursor-pointer">
        <button
          type="submit"
          disabled={pending}
          className="text-sm uppercase p-2 cursor-pointer w-full"
        >
          entrar
        </button>
      </div>
    </form>
  );
}
