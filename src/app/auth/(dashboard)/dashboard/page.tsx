'use client';
import React, { useEffect, useState, useRef } from "react";
import NoticeDetailCard from '@/components/ui/noticeDetailCard';
import { mockNotice } from "@/components/data/MockNoticeData";
import { toast, ToastContainer, Slide } from "react-toastify";


export default function NoticeListScreen() {
  const [notices, setNotices] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const loader = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadMoreNotices();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreNotices();
        }
      },
      { threshold: 1 }
    );

    if (loader.current) {
      observer.observe(loader.current);
    }

    return () => {
      if (loader.current) {
        observer.unobserve(loader.current);
      }
    };
  }, []);

  function loadMoreNotices() {
    // Simulate API call
    const newNotices = Array.from({ length: 9 }).map((_, idx) => ({
      ...mockNotice,
      id: `notice-${page}-${idx}`,
      title: `Notice ${page}-${idx}`,
    }));

    setNotices((prev) => [...prev, ...newNotices]);
    setPage((prev) => prev + 1);
  }

  function showToast(message: string) {
    toast.success(message);
  }
  

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {notices.map((notice) => (
          <NoticeDetailCard key={notice.id} initialNotice={notice} onToast={showToast} />
        ))}
      </div>

      {/* Invisible loader trigger */}
      <div ref={loader} className="h-10"></div>
      <ToastContainer
      newestOnTop={true} 
      closeOnClick={true}
      autoClose={2000}
      transition={Slide}/>
    </div>
  );
}
