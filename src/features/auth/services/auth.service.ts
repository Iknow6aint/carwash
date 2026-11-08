"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { mapBackendData } from "@/lib/api/backend-data";
import { API_ROUTES } from "@/lib/api/endpoints";
import { backendRequest } from "@/lib/api/server-api-client";
import { executeService } from "@/lib/api/server-service";
import { authenticatedBackendRequest } from "@/lib/auth/authenticated-backend";
import { AUTH_COOKIE, setSessionCookies } from "@/lib/auth/cookies";
import { landingPath, LOGIN_PATH } from "@/lib/auth/return-to";

import {
  authSessionSchema,
  changePasswordInputSchema,
  loginInputSchema,
} from "../schemas/auth.schema";
import type { ChangePasswordState, RegisterState, SignInState } from "../utils/form-state";
import { parseRegisterForm, registerErrorsFromApi } from "../utils/register-form";

/**
 * Signs in with email and password (`POST /auth/login`). Tokens go into HttpOnly cookies only;
 * then the browser is sent on (return-to.ts `landingPath`): temporary password → `/change-password`,
 * a business that isn't active → `/business-status`, otherwise `returnTo`, or super admin →
 * `/platform`, admin → `/dashboard`, cashier → `/new`. Works as a plain form post too.
 *
 * @returns The error to show (the API's own message), or redirects on success.
 */
export async function signIn(_previous: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "");
  const parsed = loginInputSchema.safeParse({
    email,
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter your email.", email };
  }

  const result = await executeService(async () => {
    const { response, requestId } = await mapBackendData(
      backendRequest<unknown>(API_ROUTES.auth.login, { method: "POST", body: parsed.data }),
      (data) => authSessionSchema.parse(data),
    );
    setSessionCookies(await cookies(), response.data);
    return {
      data: response.data.user,
      message: response.message,
      ...(requestId ? { requestId } : {}),
    };
  });
  if (!result.ok) return { error: result.error.message, email };

  const returnTo = formData.get("returnTo");
  redirect(landingPath(result.data, typeof returnTo === "string" ? returnTo : null));
}

/**
 * Registers a car wash and its owner (`POST /auth/register`). The API creates the business as
 * pending and signs the owner in; the cookies are set and the owner lands on the status page
 * until a super admin approves the business. Works as a plain form post too.
 *
 * @returns Field errors (a taken email on the email field), or redirects on success.
 */
export async function registerBusiness(
  _previous: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = parseRegisterForm(formData);
  if (!parsed.ok) return { errors: parsed.errors, values: parsed.values };

  const result = await executeService(async () => {
    const { response, requestId } = await mapBackendData(
      backendRequest<unknown>(API_ROUTES.auth.register, { method: "POST", body: parsed.input }),
      (data) => authSessionSchema.parse(data),
    );
    setSessionCookies(await cookies(), response.data);
    return {
      data: response.data.user,
      message: response.message,
      ...(requestId ? { requestId } : {}),
    };
  });
  if (!result.ok) return { errors: registerErrorsFromApi(result.error), values: parsed.values };
  redirect(landingPath(result.data));
}

/**
 * Signs out: revokes this refresh session on the API (`POST /auth/logout`, idempotent) and always
 * clears the cookies, even when the API cannot be reached. Then back to `/login`.
 */
export async function signOut(): Promise<void> {
  const store = await cookies();
  const refreshToken = store.get(AUTH_COOKIE.refresh)?.value;
  if (refreshToken) {
    try {
      await backendRequest(API_ROUTES.auth.logout, { method: "POST", body: { refreshToken } });
    } catch {
      // Signing out locally must never fail because the API is unreachable.
    }
  }
  store.delete(AUTH_COOKIE.access);
  store.delete(AUTH_COOKIE.refresh);
  redirect(LOGIN_PATH);
}

/**
 * Changes the signed-in user's password (`POST /auth/password`). The API ends every other session
 * and returns a fresh pair for this one, which replaces the cookies; then the user lands as after
 * signing in (a pending business still goes to the status page).
 */
export async function changePassword(
  _previous: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const parsed = changePasswordInputSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
  });
  if (!parsed.success) {
    const errors: ChangePasswordState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "currentPassword" || field === "newPassword") errors[field] ??= issue.message;
    }
    return { errors };
  }

  const result = await executeService(async () => {
    const { response, requestId } = await mapBackendData(
      authenticatedBackendRequest<unknown>(API_ROUTES.auth.password, {
        method: "POST",
        body: parsed.data,
      }),
      (data) => authSessionSchema.parse(data),
    );
    setSessionCookies(await cookies(), response.data);
    return {
      data: response.data.user,
      message: response.message,
      ...(requestId ? { requestId } : {}),
    };
  });

  if (!result.ok) {
    if (result.error.code === "CURRENT_PASSWORD_INCORRECT") {
      return { errors: { currentPassword: result.error.message } };
    }
    if (result.error.kind === "unauthorized") redirect(LOGIN_PATH);
    return { errors: { form: result.error.message } };
  }
  redirect(landingPath(result.data));
}
