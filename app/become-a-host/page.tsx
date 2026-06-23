"use client";

import { fetchApi } from "@/lib/auth";
import { useAuth } from "@/providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

type Step = "form" | "pending";

type FormState = {
   fullLegalName: string;
   dateOfBirth: string;
   phoneNumber: string;
   presentAddress: string;
   city: string;
   province: string;
   zipCode: string;
   idType: string;
   idNumber: string;
   idFile: File | null;
   propertyType: string;
   estimatedUnits: string;
   agreedToTerms: boolean;
};

const ID_TYPES = [
   "Philippine National ID (PhilSys)",
   "Passport",
   "Driver's License (LTO)",
   "SSS ID",
   "GSIS ID",
   "Pag-IBIG ID",
   "PhilHealth ID",
   "Voter's ID",
   "PRC ID",
   "Postal ID",
];

const PROPERTY_TYPES = [
   "Apartment / Flat",
   "Condominium Unit",
   "House",
   "Room for Rent",
   "Townhouse",
   "Commercial Space",
];

const EMPTY_FORM: FormState = {
   fullLegalName: "",
   dateOfBirth: "",
   phoneNumber: "",
   presentAddress: "",
   city: "",
   province: "",
   zipCode: "",
   idType: "",
   idNumber: "",
   idFile: null,
   propertyType: "",
   estimatedUnits: "",
   agreedToTerms: false,
};

function FileDropzone({
   file,
   onChange,
}: {
   file: File | null;
   onChange: (f: File | null) => void;
}) {
   const inputRef = useRef<HTMLInputElement>(null);
   const [dragging, setDragging] = useState(false);

   const handleDrop = useCallback(
      (e: React.DragEvent) => {
         e.preventDefault();
         setDragging(false);
         const f = e.dataTransfer.files[0];
         if (f) onChange(f);
      },
      [onChange],
   );

   return (
      <div
         onClick={() => inputRef.current?.click()}
         onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
         }}
         onDragLeave={() => setDragging(false)}
         onDrop={handleDrop}
         className={`
        relative cursor-pointer rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all
        ${
           dragging
              ? "border-amber-400 bg-amber-400/10"
              : file
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-border hover:border-amber-400/50 hover:bg-card/60"
        }
      `}
      >
         <input
            ref={inputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
         />
         {file ? (
            <div className="flex flex-col items-center gap-2">
               <span className="text-2xl">✓</span>
               <p className="text-sm font-medium text-emerald-400">
                  {file.name}
               </p>
               <p className="text-xs text-muted">
                  {(file.size / 1024).toFixed(0)} KB
               </p>
               <button
                  type="button"
                  onClick={(e) => {
                     e.stopPropagation();
                     onChange(null);
                  }}
                  className="mt-1 text-xs text-muted underline hover:text-foreground"
               >
                  Remove
               </button>
            </div>
         ) : (
            <div className="flex flex-col items-center gap-2">
               <span className="text-3xl opacity-40">🪪</span>
               <p className="text-sm font-medium text-foreground">
                  Drop your ID here or{" "}
                  <span className="text-amber-400">browse</span>
               </p>
               <p className="text-xs text-muted">JPG, PNG, or PDF · max 5 MB</p>
            </div>
         )}
      </div>
   );
}

function PendingScreen() {
   const router = useRouter();

   return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
         <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-4xl">
            ⏳
         </div>
         <h1
            className="mb-3 text-3xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
         >
            Application submitted
         </h1>
         <p className="mb-2 max-w-sm text-sm text-muted leading-relaxed">
            We&apos;re reviewing your information and ID. This typically takes{" "}
            <span className="text-foreground font-medium">
               1–3 business days
            </span>
            .
         </p>
         <p className="mb-8 max-w-sm text-sm text-muted leading-relaxed">
            You&apos;ll receive an email at your registered address once your
            host account is approved.
         </p>
         <button
            onClick={() => router.push("/")}
            className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-card transition"
         >
            Back to home
         </button>
      </div>
   );
}

function DemoGrantedScreen() {
   const router = useRouter();

   return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
         <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-4xl">
            🚀
         </div>
         <h1
            className="mb-3 text-3xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
         >
            You&apos;re now a host
         </h1>
         <p className="mb-8 max-w-sm text-sm text-muted leading-relaxed">
            Host access has been granted instantly for this demo. Head to your
            dashboard to start listing properties.
         </p>
         <button
            onClick={() => router.push("/")}
            className="rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-black hover:bg-amber-300 transition"
         >
            Go to dashboard
         </button>
      </div>
   );
}

export default function BecomeHostPage() {
   const { ready, isSignedIn, isHost, userEmail } = useAuth();
   const queryClient = useQueryClient();
   const router = useRouter();
   const [step, setStep] = useState<Step>("form");
   const [form, setForm] = useState<FormState>(EMPTY_FORM);
   const [errors, setErrors] = useState<
      Partial<Record<keyof FormState, string>>
   >({});
   const [submitting, setSubmitting] = useState(false);
   const [serverError, setServerError] = useState<string | null>(null);
   const [demoGranted, setDemoGranted] = useState(false);

   const set = useCallback(
      <K extends keyof FormState>(key: K, value: FormState[K]) =>
         setForm((f) => ({ ...f, [key]: value })),
      [],
   );

   const validate = (): boolean => {
      const e: Partial<Record<keyof FormState, string>> = {};
      if (!form.fullLegalName.trim()) e.fullLegalName = "Required";
      if (!form.dateOfBirth) e.dateOfBirth = "Required";
      if (!form.phoneNumber.trim()) e.phoneNumber = "Required";
      else if (!/^(\+63|0)9\d{9}$/.test(form.phoneNumber.replace(/\s/g, ""))) {
         e.phoneNumber = "Enter a valid PH mobile number (e.g. 09171234567)";
      }
      if (!form.presentAddress.trim()) e.presentAddress = "Required";
      if (!form.city.trim()) e.city = "Required";
      if (!form.province.trim()) e.province = "Required";
      if (!form.idType) e.idType = "Select an ID type";
      if (!form.idNumber.trim()) e.idNumber = "Required";
      if (!form.idFile) e.idFile = "Please upload a photo of your ID";
      if (!form.propertyType) e.propertyType = "Select a property type";
      if (!form.agreedToTerms) e.agreedToTerms = "You must agree to continue";
      setErrors(e);
      return Object.keys(e).length === 0;
   };

   // Demo: instantly grant host access via the capability endpoint
   const handleDemoGrant = async () => {
      setSubmitting(true);
      setServerError(null);
      try {
         const res = await fetchApi("/api/auth/capabilities/leasing/manage/", {
            method: "POST",
         });
         if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `Failed (${res.status})`);
         }
         // Invalidate the auth/me query so AuthProvider picks up the new role
         await queryClient.invalidateQueries({ queryKey: ["auth-user"] });
         setDemoGranted(true);
      } catch (err) {
         setServerError(
            err instanceof Error ? err.message : "Something went wrong",
         );
      } finally {
         setSubmitting(false);
      }
   };

   const handleSubmit = async () => {
      if (!validate()) return;

      setSubmitting(true);
      setServerError(null);

      try {
         const body = new FormData();
         body.append("full_legal_name", form.fullLegalName);
         body.append("date_of_birth", form.dateOfBirth);
         body.append("phone_number", form.phoneNumber);
         body.append("present_address", form.presentAddress);
         body.append("city", form.city);
         body.append("province", form.province);
         body.append("zip_code", form.zipCode);
         body.append("id_type", form.idType);
         body.append("id_number", form.idNumber);
         body.append("property_type", form.propertyType);
         body.append("estimated_units", form.estimatedUnits);
         if (form.idFile) body.append("id_file", form.idFile);

         const res = await fetchApi("/api/host-applications/", {
            method: "POST",
            body,
         });

         if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `Submission failed (${res.status})`);
         }

         setStep("pending");
      } catch (err) {
         setServerError(
            err instanceof Error ? err.message : "Submission failed",
         );
      } finally {
         setSubmitting(false);
      }
   };

   if (!ready) return null;

   if (!isSignedIn) {
      return (
         <div className="flex min-h-screen items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-3 text-center">
               <span className="text-3xl">🔒</span>
               <p className="text-sm font-medium text-foreground">
                  Sign in required
               </p>
               <p className="text-xs text-muted">
                  Please sign in to apply as a host.
               </p>
            </div>
         </div>
      );
   }

   if (isHost || demoGranted) return <DemoGrantedScreen />;

   if (step === "pending") return <PendingScreen />;

   const field = (
      label: string,
      key: keyof FormState,
      props: React.InputHTMLAttributes<HTMLInputElement> = {},
   ) => (
      <div className="flex flex-col gap-1.5">
         <label className="text-xs font-semibold uppercase tracking-widest text-muted">
            {label}
         </label>
         <input
            {...props}
            value={form[key] as string}
            onChange={(e) => set(key, e.target.value as FormState[typeof key])}
            className={`
          rounded-lg border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50
          focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition
          ${errors[key] ? "border-red-500/60" : "border-border"}
        `}
         />
         {errors[key] && <p className="text-xs text-red-400">{errors[key]}</p>}
      </div>
   );

   const select = (label: string, key: keyof FormState, options: string[]) => (
      <div className="flex flex-col gap-1.5">
         <label className="text-xs font-semibold uppercase tracking-widest text-muted">
            {label}
         </label>
         <select
            value={form[key] as string}
            onChange={(e) => set(key, e.target.value as FormState[typeof key])}
            className={`
          rounded-lg border bg-card px-4 py-2.5 text-sm text-foreground
          focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition
          ${errors[key] ? "border-red-500/60" : "border-border"}
        `}
         >
            <option value="">Select…</option>
            {options.map((o) => (
               <option key={o} value={o}>
                  {o}
               </option>
            ))}
         </select>
         {errors[key] && <p className="text-xs text-red-400">{errors[key]}</p>}
      </div>
   );

   return (
      <div className="min-h-screen bg-white px-4 py-16">
         <div className="mx-auto max-w-2xl">
            <div className="mb-10">
               <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-400">
                  Host Application
               </p>
               <h1
                  className="mb-3 text-4xl font-bold tracking-tight text-foreground"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
               >
                  Become a host
               </h1>
               <p className="text-sm text-muted leading-relaxed">
                  List your property on Rent Apart. We verify every host to keep
                  tenants safe — this takes 1–3 business days.
               </p>
               {userEmail && (
                  <p className="mt-2 text-xs text-muted">
                     Applying as{" "}
                     <span className="text-foreground">{userEmail}</span>
                  </p>
               )}
            </div>

            {/* ── Demo banner ── */}
            <div className="mb-8 flex gap-4 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-5">
               <span className="mt-0.5 text-xl">🚧</span>
               <div className="flex-1">
                  <p className="mb-1 text-sm font-semibold text-foreground">
                     Host verification isn&apos;t live yet
                  </p>
                  <p className="mb-3 text-xs leading-relaxed text-muted">
                     For this demo, host access is granted instantly — no ID
                     review or approval wait needed.
                  </p>
                  {serverError && (
                     <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                        {serverError}
                     </p>
                  )}
                  <button
                     type="button"
                     onClick={handleDemoGrant}
                     disabled={submitting}
                     className="rounded-full bg-amber-400 px-5 py-2 text-xs font-semibold text-black hover:bg-amber-300 disabled:opacity-50 transition"
                  >
                     {submitting ? "Processing…" : "Become a host instantly →"}
                  </button>
               </div>
            </div>

            {/* ── Blurred form (non-interactive) ── */}
            <div className="relative select-none">
               {/* Blur + fade overlay */}
               <div
                  className="absolute inset-0 z-10 rounded-2xl"
                  style={{
                     backdropFilter: "blur(4px)",
                     WebkitBackdropFilter: "blur(4px)",
                     background:
                        "linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.55) 60%, rgba(255,255,255,0.88) 100%)",
                  }}
               />

               <div className="pointer-events-none opacity-60">
                  <div className="flex flex-col gap-8">
                     <section className="rounded-2xl border border-border bg-card/40 p-6">
                        <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-amber-400">
                           01 · Personal Information
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                           <div className="sm:col-span-2">
                              {field("Full Legal Name", "fullLegalName", {
                                 placeholder:
                                    "As it appears on your government ID",
                              })}
                           </div>
                           {field("Date of Birth", "dateOfBirth", {
                              type: "date",
                           })}
                           {field("Mobile Number", "phoneNumber", {
                              placeholder: "09171234567",
                              type: "tel",
                           })}
                        </div>
                     </section>

                     <section className="rounded-2xl border border-border bg-card/40 p-6">
                        <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-amber-400">
                           02 · Present Address
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                           <div className="sm:col-span-2">
                              {field("Street / Barangay", "presentAddress", {
                                 placeholder:
                                    "Unit, building, street, barangay",
                              })}
                           </div>
                           {field("City / Municipality", "city", {
                              placeholder: "Cebu City",
                           })}
                           {field("Province", "province", {
                              placeholder: "Cebu",
                           })}
                           {field("ZIP Code", "zipCode", {
                              placeholder: "6000",
                           })}
                        </div>
                     </section>

                     <section className="rounded-2xl border border-border bg-card/40 p-6">
                        <h2 className="mb-1 text-xs font-bold uppercase tracking-widest text-amber-400">
                           03 · Government ID Verification
                        </h2>
                        <p className="mb-5 text-xs text-muted">
                           Required under BSP and DTI guidelines for property
                           lease agreements in the Philippines.
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2">
                           {select("ID Type", "idType", ID_TYPES)}
                           {field("ID Number", "idNumber", {
                              placeholder: "e.g. 1234-5678-9012",
                           })}
                           <div className="sm:col-span-2">
                              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
                                 Upload ID Photo
                              </label>
                              <FileDropzone
                                 file={form.idFile}
                                 onChange={(f) => set("idFile", f)}
                              />
                           </div>
                        </div>
                     </section>

                     <section className="rounded-2xl border border-border bg-card/40 p-6">
                        <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-amber-400">
                           04 · Property Intent
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                           {select(
                              "Type of Property",
                              "propertyType",
                              PROPERTY_TYPES,
                           )}
                           {field(
                              "Estimated Units to List",
                              "estimatedUnits",
                              {
                                 type: "number",
                                 min: "1",
                                 placeholder: "1",
                              },
                           )}
                        </div>
                     </section>

                     <div className="rounded-2xl border border-border bg-card/40 p-6">
                        <label className="flex cursor-pointer items-start gap-3">
                           <input
                              type="checkbox"
                              checked={form.agreedToTerms}
                              onChange={(e) =>
                                 set("agreedToTerms", e.target.checked)
                              }
                              className="mt-0.5 h-4 w-4 accent-amber-400"
                           />
                           <span className="text-sm text-muted leading-relaxed">
                              I confirm that all information provided is
                              accurate and true. I understand that submitting
                              false documents is a violation of Philippine law
                              (RA 11032, Civil Code Art. 19–21) and may result
                              in account termination.
                           </span>
                        </label>
                     </div>

                     <div className="flex items-center justify-between gap-4">
                        <button
                           type="button"
                           className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-muted"
                        >
                           Cancel
                        </button>
                        <button
                           type="button"
                           disabled
                           className="rounded-full bg-amber-400 px-8 py-2.5 text-sm font-semibold text-black opacity-50"
                        >
                           Submit application
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}