"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Login from './(auth)/Adminlogin';
import Signup from './(auth)/Adminsignup';
import { verifyAuth, getUserData } from '@/app/utils/auth';

export default function page() {
  const [pageToggle, setPageToggle] = useState(0);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const userData = getUserData();
      
      // If userData exists, verify with backend
      if (userData) {
        const isAuth = await verifyAuth();
        if (isAuth) {
          router.push('/admin/dashboard');
          return;
        }
      }
      
      setIsChecking(false);
    };

    checkAuthAndRedirect();
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {pageToggle === 0 ? (
        <Login setPageToggle={setPageToggle} />
      ) : (
        <Signup setPageToggle={setPageToggle} />
      )}
    </>
  );
}
