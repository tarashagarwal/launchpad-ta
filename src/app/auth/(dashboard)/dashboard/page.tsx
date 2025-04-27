'use client';
import React, { useEffect, useState, useRef } from "react";
import NoticeDetailCard from '@/components/ui/noticeDetailCard';
import { mockNotice } from "@/components/data/MockNoticeData";
import { toast, ToastContainer, Slide } from "react-toastify";


export default function NoticeListScreen() {
  const [notices, setNotices] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const loader = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    fetchNotices();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNotices();
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

  async function fetchNotices() {
    setLoading(true);
    try {
      const response = await fetch(`https://wp9s6wxn0h.execute-api.us-east-1.amazonaws.com/notices?page=${page}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notices');
      }
      const data = await response.json();

      setNotices((prev) => [...prev, ...data]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load more notices!");
    } finally {
      setLoading(false);
    }
  }

  function showToast(title: string, message: string) {
    const truncatedTitle = title.length > 10 ? `${title.slice(0, 10)}...` : title;
    toast.success(
      <div>
        <strong>{truncatedTitle}</strong>
        <br />
        {message}
      </div>
    );
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
      closeOnClick
      draggable
      autoClose={3000}
      transition={Slide}/>
    </div>
  );
}
