"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";

import AuthShell from "@/app/components/ui/AuthShell";
import { apiFetch } from "@/app/lib/api";

type SignupForm = {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
};

const EMPTY_FORM: SignupForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
};

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<SignupForm>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: keyof SignupForm, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      // No role is sent: the server always creates resident accounts.
      await apiFetch("/users/signup", { method: "POST", body: form });
      router.push("/login");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div>
        <p className="text-xs font-medium text-primary">Resident onboarding</p>
        <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.035em] text-foreground">
          Create your account
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Join the Palm Grove portal. New accounts are created as residents.
        </p>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/[0.06] px-3.5 py-3 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSignup} className="mt-7 space-y-4">
        <Field
          label="Full name"
          value={form.name}
          onChange={(value) => updateField("name", value)}
          placeholder="Asha Rao"
          icon={User}
          autoComplete="name"
        />

        <Field
          label="Email address"
          type="email"
          value={form.email}
          onChange={(value) => updateField("email", value)}
          placeholder="you@example.com"
          icon={Mail}
          autoComplete="email"
        />

        <Field
          label="Phone number"
          type="tel"
          value={form.phone}
          onChange={(value) => updateField("phone", value)}
          placeholder="+91 98765 43210"
          icon={Phone}
          autoComplete="tel"
        />

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-foreground">
            Flat / house address
          </span>
          <span className="relative block">
            <MapPin className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <textarea
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              placeholder="Flat number, building, society"
              required
              rows={3}
              autoComplete="street-address"
              className="min-h-[88px] w-full resize-none rounded-[10px] border border-input bg-card py-3 pl-10 pr-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </span>
        </label>

        <Field
          label="Password"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={(value) => updateField("password", value)}
          placeholder="At least 8 characters"
          icon={LockKeyhole}
          autoComplete="new-password"
          minLength={8}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
        />

        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create account"}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
        By creating an account, you agree to the society&apos;s resident rules
        and data policies.
      </p>
    </AuthShell>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  autoComplete,
  minLength,
  trailing,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
  autoComplete?: string;
  minLength?: number;
  trailing?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-foreground">
        {label}
      </span>

      <span className="relative block">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          required
          className="h-11 w-full rounded-[10px] border border-input bg-card pl-10 pr-10 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
        {trailing && (
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2">
            {trailing}
          </span>
        )}
      </span>
    </label>
  );
}
