"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Loader2, Save, User, X } from "lucide-react";
import { profileApi } from "@/lib/api-client";
import type { UserProfileDto } from "@/types";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (profile: UserProfileDto) => void;
}

export function EditProfileModal({ isOpen, onClose, onSaved }: EditProfileModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setError("");
    setIsLoading(true);
    profileApi
      .getProfile()
      .then((res) => {
        const profile = res.data as UserProfileDto;
        setFirstName(profile.firstName || "");
        setLastName(profile.lastName || "");
        setPhoneNumber(profile.phoneNumber || "");
        setProfilePictureUrl(profile.profilePictureUrl || "");
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      const res = await profileApi.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        profilePictureUrl: profilePictureUrl.trim() || undefined,
      });
      const updated = res.data as UserProfileDto;

      // Persist updated name/avatar in local storage so header updates without re-login
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("auth");
        if (raw) {
          const auth = JSON.parse(raw);
          auth.firstName = updated.firstName;
          auth.lastName = updated.lastName;
          auth.phoneNumber = updated.phoneNumber;
          auth.profilePictureUrl = updated.profilePictureUrl;
          localStorage.setItem("auth", JSON.stringify(auth));
        }
      }

      onSaved(updated);
      onClose();
    } catch {
      setError("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const avatarFallback = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "?";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2"
          >
            <div className="rounded-[32px] border border-border/60 bg-card p-8 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Edit Profile</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-5">
                  {/* Avatar preview */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      {profilePictureUrl ? (
                        <img
                          src={profilePictureUrl}
                          alt="Avatar preview"
                          className="h-24 w-24 rounded-full border-4 border-primary/20 object-cover shadow-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary/20 bg-primary/10 text-2xl font-bold text-primary shadow-lg">
                          {avatarFallback}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                        <Camera className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Paste an image URL below to update your avatar</p>
                  </div>

                  {/* Profile picture URL */}
                  <div className="space-y-1.5">
                    <label htmlFor="profilePictureUrl" className="text-sm font-medium">
                      Profile picture URL
                    </label>
                    <input
                      id="profilePictureUrl"
                      type="url"
                      value={profilePictureUrl}
                      onChange={(e) => setProfilePictureUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  {/* Name fields */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="firstName" className="text-sm font-medium">
                        First name
                      </label>
                      <input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="lastName" className="text-sm font-medium">
                        Last name
                      </label>
                      <input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="phoneNumber" className="text-sm font-medium">
                      Phone number
                    </label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1234567890"
                      className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  {error && (
                    <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isSaving ? "Saving…" : "Save changes"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
