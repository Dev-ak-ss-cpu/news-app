"use client";
import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ArticleHeader from './ArticleHeader';
import ArticleContent from './ArticleContent';
import ArticleSidebar from './ArticleSidebar';
import Footer from '@/app/Components/Footer';

export default function ArticleDetails({ article, categoryPath = [] }) {

    // Show loading while validating or redirecting
    if (!article) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading article...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <ArticleHeader article={article} categoryPath={categoryPath} />

            <main className="container mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Main Article Content */}
                    <div className="flex-1 min-w-0">
                        <ArticleContent article={article} />
                    </div>

                    {/* Sidebar */}
                    <div className="hidden lg:block w-80 flex-shrink-0">
                        <ArticleSidebar article={article} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}