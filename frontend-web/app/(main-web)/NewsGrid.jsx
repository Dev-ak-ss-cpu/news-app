import NewsCard from "./NavCard";

export default function NewsGrid() {
    const newsItems = [
        {
            title: "Bihar CM Oath: 10वीं बार मुख्यमंत्री बने नीतीश, पांच-पांच नेताओं को एकसाथ दिलाई गई शपथ, ये नेता बने मंत्री",
            location: "Patna",
            variant: "highlighted"
        },
        {
            title: "सांसद नीतीश के पास थी ज्यादा जमीनें: अब बिहार में नहीं है कोई खेत-घर, 20 साल में सीएम की दौलत कितनी बढ़ी?",
            tags: ["#nitish kumar", "#oath ceremony in bihar", "#bihar cm nitish kumar"]
        },
        {
            title: "Bihar CM Oath: 10वीं बार मुख्यमंत्री बने नीतीश, पांच-पांच नेताओं को एकसाथ दिलाई गई शपथ, ये नेता बने मंत्री"
        },
        {
            title: "Bihar CM Oath: 10वीं बार मुख्यमंत्री बने नीतीश, पांच-पांच नेताओं को एकसाथ दिलाई गई शपथ, ये नेता बने मंत्री"
        },
        {
            title: "Bihar CM Oath: 10वीं बार मुख्यमंत्री बने नीतीश, पांच-पांच नेताओं को एकसाथ दिलाई गई शपथ, ये नेता बने मंत्री"
        },
        {
            title: "Bihar CM Oath: 10वीं बार मुख्यमंत्री बने नीतीश, पांच-पांच नेताओं को एकसाथ दिलाई गई शपथ, ये नेता बने मंत्री"
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsItems.map((news, index) => (
                    <NewsCard
                        key={index}
                        title={news.title}
                        location={news.location}
                        date={news.date}
                        category={news.category}
                        tags={news.tags}
                        variant={news.variant}
                    />
                ))}
            </div>
        </div>
    );
}