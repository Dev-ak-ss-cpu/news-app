import React from 'react'
import {
    Chip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
} from '@heroui/react';
import {
    Play
} from "lucide-react";
import { getYouTubeThumbnail } from '@/app/Helper';

export default function ArticlePreviewPopup({ isOpen, onOpenChange, article }) {

    const youtubeThumbnail = article.youtubeVideo
        ? getYouTubeThumbnail(article.youtubeVideo)
        : "";
    return (
        <div className="flex flex-col gap-2">
            <Modal isOpen={isOpen} scrollBehavior="inside" onOpenChange={onOpenChange} size="5xl" className='scrollbar-thin scrollbar-thumb'>
                <ModalContent>
                    <ModalHeader>Article Preview</ModalHeader>
                    <ModalBody>
                        <div className="max-w-none">
                            {/* Article Title */}
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">
                                {article.title || "Untitled Article"}
                            </h1>

                            {/* Featured Image */}
                            {article.featuredImage && (
                                <div className="mb-6 w-full overflow-hidden rounded-xl">
                                    <img
                                        src={article.featuredImage}
                                        alt={article.title || "Untitled Article"}
                                        className="w-full max-h-[240px] sm:max-h-[360px] lg:max-h-[520px] object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            )}

                            {article.excerpt && (
                                <p className="text-lg text-gray-600 italic">{article.excerpt}</p>
                            )}

                            <div className="flex gap-2 mb-4">
                                {article.isBreaking && (
                                    <Chip color="danger" variant="flat">Breaking News</Chip>
                                )}
                                {article.isTrending && (
                                    <Chip color="primary" variant="flat">Trending</Chip>
                                )}
                            </div>
                            <div className="text-gray-600 mb-6">
                                By {article.author} • {new Date(article.publishDate).toLocaleDateString()}
                            </div>
                            <div
                                className="raw-html"
                                dangerouslySetInnerHTML={{ __html: article.content || '<p>No content yet.</p>' }}
                            />
                            {article.youtubeVideo && (
                                <div className="my-6">
                                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                                        <img
                                            src={youtubeThumbnail}
                                            alt="YouTube Video"
                                            className="w-full h-auto max-h-[550px] object-cover rounded-xl shadow-md"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-red-600 rounded-full p-4 hover:bg-red-700 transition-colors">
                                                <Play size={32} className="text-white" />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">YouTube Video</p>
                                </div>
                            )}

                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div >

    )
}
