import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function LandingLayout({ children }) {
  return (
    <div className="min-h-screen landing-hero flex flex-col">
      <Navbar />
      <main className="page-shell flex-1 pt-24 md:pt-28 pb-14 md:pb-16 lg:pb-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default LandingLayout;