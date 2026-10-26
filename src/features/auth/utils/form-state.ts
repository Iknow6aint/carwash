/** State the sign-in Server Action hands back to `useActionState`. */
export interface SignInState {
  /** One plain sentence, shown in the ink-bordered error block. */
  error: string | null;
  /** Kept so the form can refill the email after an error. */
  email: string;
}

export const initialSignInState: SignInState = { error: null, email: "" };

/** State the change-password Server Action hands back to `useActionState`. */
export interface ChangePasswordState {
  errors: {
    currentPassword?: string;
    newPassword?: string;
    /** Not tied to a field: shown above the button. */
    form?: string;
  };
}

export const initialChangePasswordState: ChangePasswordState = { errors: {} };
