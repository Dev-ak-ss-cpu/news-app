import { Button } from '@heroui/react';
import { ArrowLeft, Share2, Bookmark, Printer } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

export default function ArticleHeader() {
//   const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Back Button and Logo */}
          <div className="flex items-center gap-4">
            <Button
              isIconOnly
              variant="light"
              className="text-gray-600"
            //   onPress={() => navigate(-1)}
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-bold text-red-600">न्यूज़</h1>
          </div>

          {/* Article Actions */}
          <div className="flex items-center gap-2">
            <Button isIconOnly variant="light" className="text-gray-600">
              <Bookmark size={18} />
            </Button>
            <Button isIconOnly variant="light" className="text-gray-600">
              <Share2 size={18} />
            </Button>
            <Button isIconOnly variant="light" className="text-gray-600">
              <Printer size={18} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}