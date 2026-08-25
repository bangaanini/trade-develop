"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function KYCModal({ isOpen, onClose, onSuccess }: KYCModalProps) {
  const [name, setName] = useState("");
  const [idCardNumber, setIdCardNumber] = useState("");
  const [idCardFront, setIdCardFront] = useState<File | null>(null);
  const [idCardBack, setIdCardBack] = useState<File | null>(null);
  const [previewFront, setPreviewFront] = useState<string>("");
  const [previewBack, setPreviewBack] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      if (side === 'front') {
        setIdCardFront(file);
      } else {
        setIdCardBack(file);
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'front') {
          setPreviewFront(reader.result as string);
        } else {
          setPreviewBack(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!idCardFront || !idCardBack) {
        setError("Please upload both front and back photos of your ID card");
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("idCardNumber", idCardNumber);
      formData.append("idCardFront", idCardFront);
      formData.append("idCardBack", idCardBack);

      const res = await fetch("/api/kyc/submit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Submission failed");
        return;
      }

      toast.success("✅ KYC submitted successfully! Awaiting admin review.");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">KYC Verification</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              className="w-full p-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="As shown on your ID card"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">ID Card Number</label>
            <input
              type="text"
              className="w-full p-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your ID card number"
              value={idCardNumber}
              onChange={(e) => setIdCardNumber(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Photo Front ID Card</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'front')}
              className="hidden"
              id="idCardFrontUpload"
              required
            />
            <label
              htmlFor="idCardFrontUpload"
              className="block w-full p-4 border-2 border-dashed border-border rounded-lg text-center cursor-pointer hover:border-primary transition"
            >
              {previewFront ? (
                <img src={previewFront} alt="ID Card Front" className="max-h-48 mx-auto rounded" />
              ) : (
                <div className="text-muted-foreground">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>Click to upload front of ID card</p>
                  <p className="text-xs mt-1">JPG, PNG, WebP (Max 5MB)</p>
                </div>
              )}
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Photo Back ID Card</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'back')}
              className="hidden"
              id="idCardBackUpload"
              required
            />
            <label
              htmlFor="idCardBackUpload"
              className="block w-full p-4 border-2 border-dashed border-border rounded-lg text-center cursor-pointer hover:border-primary transition"
            >
              {previewBack ? (
                <img src={previewBack} alt="ID Card Back" className="max-h-48 mx-auto rounded" />
              ) : (
                <div className="text-muted-foreground">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>Click to upload back of ID card</p>
                  <p className="text-xs mt-1">JPG, PNG, WebP (Max 5MB)</p>
                </div>
              )}
            </label>
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-lg border border-border hover:bg-muted transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit KYC"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
