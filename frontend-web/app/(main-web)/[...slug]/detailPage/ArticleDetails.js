"use client";
import React from 'react';
import ArticleHeader from './ArticleHeader';
import ArticleContent from './ArticleContent';
import ArticleSidebar from './ArticleSidebar';

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

            <main className="container mx-auto px-2 md:px-4 py-4 md:py-8">
                <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
                    <div className="flex-1 min-w-0">
                        <ArticleContent article={article} />
                    </div>

                    {/* Sidebar - Show below content on mobile, beside on desktop */}
                    <div className="lg:block w-full lg:w-80 xl:w-108 lg:shrink-0">
                        <ArticleSidebar 
                            article={article}
                            sidebarData={sidebarData}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}