import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

import API from "../api/axios";
import { emitAuthChanged } from "../utils/auth";

const GoogleSignIn = ({ role = "customer", mode = "signin", onError }) => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleSuccess = async (credentialResponse) => {
    try {
      setSubmitting(true);

      if (!credentialResponse.credential) {
        throw new Error("Google did not return a credential token.");
      }

      const res = await API.post("/auth/google", {
        token: credentialResponse.credential,
        role,
      });

      localStorage.setItem("token", res.data.user.token);
      localStorage.setItem("authUser", JSON.stringify(res.data.user));
      emitAuthChanged();

      navigate("/dashboard", {
        state: {
          feedback: {
            type: "success",
            title: "Signed in",
            message: `Welcome, ${res.data.user.name || "you're signed in"}.`,
          },
        },
      });
    } catch (error) {
      onError?.(
        error.response?.data?.message ||
          error.message ||
          "Google authentication failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!googleClientId) {
    return (
      <div className="surface-panel border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-slate-600 shadow-sm">
        Google sign-in is unavailable until VITE_GOOGLE_CLIENT_ID is configured.
      </div>
    );
  }

  return (
    <div className={submitting ? "pointer-events-none opacity-70" : ""}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => onError?.("Google sign-in was cancelled or failed.")}
        text={mode === "signup" ? "signup_with" : "continue_with"}
        shape="pill"
        size="large"
        width="100%"
      />
    </div>
  );
};

export default GoogleSignIn;
