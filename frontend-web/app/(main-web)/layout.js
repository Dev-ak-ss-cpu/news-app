import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { fetchRootCategories, fetchAllCategoriesFlat } from "../utils/serverApi";

export default async function MainLayout({ children }) {
  // Fetch categories server-side
  const [rootCategoriesResponse, allCategoriesResponse] = await Promise.all([
    fetchRootCategories(),
    fetchAllCategoriesFlat(),
  ]);

  const rootCategories = rootCategoriesResponse.success 
    ? rootCategoriesResponse.data || [] 
    : [];
  
  const allCategories = allCategoriesResponse.success 
    ? allCategoriesResponse.data || [] 
    : [];

  return (
    <>
      <Header 
        initialRootCategories={rootCategories}
        initialAllCategories={allCategories}
      />
      {children}
      <Footer rootCategories={rootCategories} />
    </>
  );
}
