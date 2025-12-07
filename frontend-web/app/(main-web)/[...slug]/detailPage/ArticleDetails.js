"use client";
import React from 'react';
import ArticleHeader from './ArticleHeader';
import ArticleContent from './ArticleContent';
import ArticleSidebar from './ArticleSidebar';
import Footer from '@/app/Components/Footer';

export default function ArticleDetails({ 
  article, 
  categoryPath = [],
  sidebarData = {} // Pre-fetched sidebar data
}) {
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
                    <div className="flex-1 min-w-0">
                        <ArticleContent article={article} />
                    </div>

                    <div className="hidden lg:block w-80 shrink-0">
                        <ArticleSidebar 
                            article={article}
                            sidebarData={sidebarData}
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}