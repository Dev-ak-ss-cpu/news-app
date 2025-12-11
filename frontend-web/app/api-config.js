// const isProduction = process.env.NODE_ENV === "production";

// Set base URL depending on environment
const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default BASE_API_URL;
