"use client";

import { useState, useEffect } from "react";
import { FiHeart } from "react-icons/fi";
import axiosInstance from "@/lib/axios";

interface ShortlistButtonProps {
  lawyerId: string;
  onToggle?: (shortlisted: boolean) => void;
}

export default function ShortlistButton({ lawyerId, onToggle }: ShortlistButtonProps) {
  const [shortlisted, setShortlisted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkShortlist = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }
        
        const res = await axiosInstance.get(`/shortlist/check/${lawyerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShortlisted(res.data.shortlisted);
      } catch (err) {
        console.error("Failed to check shortlist:", err);
      } finally {
        setLoading(false);
      }
    };
    checkShortlist();
  }, [lawyerId]);

  const toggleShortlist = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to shortlist lawyers.");
        return;
      }

      const res = await axiosInstance.post(
        "/shortlist/toggle",
        { lawyerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setShortlisted(res.data.shortlisted);
      if (onToggle) onToggle(res.data.shortlisted);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update shortlist.");
    }
  };

  if (loading) {
    return (
      <button className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-border dark:border-white/10">
        <FiHeart className="text-text-muted" size={18} />
      </button>
    );
  }

  return (
    <button
      onClick={toggleShortlist}
      className={`w-9 h-9 flex items-center justify-center rounded-full border transition ${
        shortlisted
          ? "bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-500"
          : "border-gray-border dark:border-white/10 hover:border-primary"
      }`}
      aria-label={shortlisted ? "Remove from shortlist" : "Add to shortlist"}
    >
      <FiHeart
        size={18}
        className={shortlisted ? "text-red-500 fill-red-500" : "text-text-muted"}
      />
    </button>
  );
}