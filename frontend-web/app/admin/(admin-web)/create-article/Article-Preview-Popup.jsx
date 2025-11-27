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
                        <div className="prose max-w-none">
                            <h1>{article.title || 'Untitled Article'}</h1>
                            {article.excerpt && (
                                <p className="text-lg text-gray-600 italic">{article.excerpt}</p>
                            )}

                            {article.youtubeVideo && (
                                <div className="my-6">
                                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                                        <img
                                            src={youtubeThumbnail}
                                            alt="YouTube Video"
                                            className="w-full h-full object-cover"
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

                            {article.featuredImage && !article.youtubeVideo && (
                                <img
                                    src={article.featuredImage}
                                    alt="Featured"
                                    className="w-full h-64 object-cover rounded-lg my-4"
                                />
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
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>

    )
}
