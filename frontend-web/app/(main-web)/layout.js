import Header from "../Components/Header";

export default function MainLayout({ children }) {
  return (
    <>
    <Header />
      {children}
    </>
  );
}
