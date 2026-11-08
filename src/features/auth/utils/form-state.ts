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

/** What the registration form keeps between attempts: everything typed except the password. */
export interface RegisterValues {
  businessName: string;
  businessPhone: string;
  businessAddress: string;
  name: string;
  email: string;
}

/** State the registration Server Action hands back to `useActionState`. */
export interface RegisterState {
  errors: Partial<Record<keyof RegisterValues | "password" | "form", string>>;
  values: RegisterValues;
}

export const initialRegisterState: RegisterState = {
  errors: {},
  values: { businessName: "", businessPhone: "", businessAddress: "", name: "", email: "" },
};
