import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Shop from "../components/Shop";

export default function ShopPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-midnight">
      <div className="landing-hero relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-10 h-40 w-40 bg-pink-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 h-60 w-60 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <header className="border-b border-white/10 bg-midnight/80 backdrop-blur-xl sticky top-0 z-50">
            <div className="container mx-auto flex items-center justify-between px-4 py-3 md:py-4 gap-3">
              <h1 className="text-base sm:text-lg md:text-2xl font-black text-white tracking-wide">🎮 SPEAKS SHOP</h1>
              <Button
                onClick={() => navigate(-1)}
                className="text-xs md:text-sm px-5 py-2.5 uppercase tracking-wider font-black bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl shadow-[0_6px_0_#7c1c72,0_10px_20px_rgba(219,39,119,0.35)] hover:shadow-[0_4px_0_#7c1c72,0_8px_16px_rgba(219,39,119,0.4)] hover:translate-y-[2px] hover:from-pink-500 hover:to-purple-500 active:shadow-none active:translate-y-[6px] transition-all duration-150"
              >
                BACK
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-6 md:py-8 lg:py-12">
            <div className="mb-6 md:mb-8 rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-5 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <h2 className="arcade-title text-3xl lg:text-5xl">💎 Enter the Shop</h2>
              <p className="mt-3 text-white/70 text-sm md:text-base">Upgrade your experience and unlock exclusive features</p>
            </div>

            <Shop />
          </main>
        </div>
      </div>
    </div>
  );
}
