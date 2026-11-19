import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { supabase } from "@/app/lib/supabase";

type InviteStatus = "checking" | "ready" | "saving" | "invalid";

export default function useAcceptInvite() {
  const router = useRouter();
  const [status, setStatus] = useState<InviteStatus>("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setError("Invite setup is not connected to Supabase.");
      setStatus("invalid");
      return;
    }
    const auth = client.auth;

    let active = true;
    const {
      data: { subscription },
    } = auth.onAuthStateChange((_event, session) => {
      if (!active || !session) return;
      setEmail(session.user.email ?? "");
      setError("");
      setStatus("ready");
    });

    async function checkInviteSession() {
      const { data, error: sessionError } = await auth.getSession();
      if (!active) return;
      if (sessionError) {
        setError(sessionError.message);
        setStatus("invalid");
        return;
      }
      if (!data.session) {
        setError(
          "This invitation link is invalid or expired. Ask your Naya operator to send a new one.",
        );
        setStatus("invalid");
        return;
      }

      setEmail(data.session.user.email ?? "");
      setStatus("ready");
    }

    void checkInviteSession();
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function setInvitePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      setError("Invite setup is not connected to Supabase.");
      setStatus("invalid");
      return;
    }
    if (password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setStatus("saving");
    setError("");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setStatus("ready");
      return;
    }

    router.replace("/app/household");
  }

  return {
    status,
    email,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    setInvitePassword,
  };
}
