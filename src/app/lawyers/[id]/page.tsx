"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

type Lawyer = {
  _id: string;
  name: string;
  photo: string;
  specialization: string;
  bio: string;
  hourlyRate: number;
  status: string;
  createdAt: string;
};

export default function LawyerDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [hireStatus, setHireStatus] = useState("");
  const [hireLoading, setHireLoading] = useState(false);

  useEffect(() => {
    const fetchLawyer = async () => {
      try {
        const res = await axiosInstance.get(`/lawyers/${id}`);
        setLawyer(res.data.lawyer);
      } catch (err) {
        console.error("Failed to fetch lawyer:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchLawyer();
  }, [id]);

  const handleHire = async () => {
    setHireLoading(true);
    setHireStatus("");
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.post(
        "/hiring",
        { lawyerId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHireStatus("success");
    } catch (err: any) {
      setHireStatus(err.response?.data?.message || "Something went wrong.");
    } finally {
      setHireLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-20 animate-pulse">
        <div className="h-40 w-40 rounded-full bg-gray-soft mx-auto mb-6"></div>
        <div className="h-6 bg-gray-soft rounded w-1/3 mx-auto mb-3"></div>
        <div className="h-4 bg-gray-soft rounded w-1/4 mx-auto"></div>
      </main>
    );
  }

  if (!lawyer) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-20 text-center text-text-muted">
        Lawyer not found.
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center">
        <div className="relative w-36 h-36 rounded-full overflow-hidden mx-auto mb-5 ring-4 ring-primary">
          <Image src={lawyer.photo} alt={lawyer.name} fill className="object-cover" />
        </div>
        <h1 className="font-heading text-3xl text-primary mb-1">{lawyer.name}</h1>
        <p className="text-text-muted mb-3">{lawyer.specialization}</p>

        <span
          className={`inline-block text-xs px-3 py-1 rounded-full mb-6 ${
            lawyer.status === "available"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {lawyer.status === "available" ? "Available" : "Busy"}
        </span>

        <div className="border border-gray-border rounded-xl p-6 text-left mb-8">
          <h2 className="font-medium text-primary mb-2">About</h2>
          <p className="text-sm text-text-muted leading-relaxed mb-4">{lawyer.bio}</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-text-muted">Consultation Fee</p>
              <p className="font-semibold text-primary">${lawyer.hourlyRate}/hr</p>
            </div>
            <div>
              <p className="text-text-muted">Date Joined</p>
              <p className="font-semibold text-primary">
                {new Date(lawyer.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {user ? (
          user.role === "user" ? (
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary-light transition"
            >
              Hire This Lawyer
            </button>
          ) : (
            <p className="text-sm text-text-muted">
              Only clients can hire lawyers.
            </p>
          )
        ) : (
          <p className="text-sm text-text-muted">
            Please login as a client to hire this lawyer.
          </p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center">
            {hireStatus === "success" ? (
              <>
                <h3 className="font-heading text-xl text-primary mb-2">
                  Request Sent!
                </h3>
                <p className="text-sm text-text-muted mb-5">
                  Your hiring request has been sent to {lawyer.name}. You can
                  track its status in your dashboard.
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-primary text-white px-6 py-2 rounded-full text-sm font-medium"
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <h3 className="font-heading text-xl text-primary mb-2">
                  Confirm Hiring Request
                </h3>
                <p className="text-sm text-text-muted mb-5">
                  Send a hiring request to {lawyer.name} for ${lawyer.hourlyRate}/hr?
                </p>
                {hireStatus && (
                  <p className="text-red-600 text-sm mb-4">{hireStatus}</p>
                )}
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowModal(false)}
                    className="border border-gray-border px-5 py-2 rounded-full text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleHire}
                    disabled={hireLoading}
                    className="bg-primary text-white px-5 py-2 rounded-full text-sm font-medium disabled:opacity-60"
                  >
                    {hireLoading ? "Sending..." : "Confirm"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}