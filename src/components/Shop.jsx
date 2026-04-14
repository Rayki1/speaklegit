import { useContext, useRef, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import { UserContext } from "../context/UserContext";

const hintProducts = [
  {
    key: "neonMagnet",
    name: "Neon Magnet",
    cost: 15,
    icon: "🧲",
    description: "Snaps the first and last spelling letters into place.",
  },
  {
    key: "shadowLetter",
    name: "Shadow Letter",
    cost: 10,
    icon: "👻",
    description: "Flashes a ghost letter on one empty spelling slot.",
  },
  {
    key: "underscoreReveal",
    name: "Underscore Pulse",
    cost: 12,
    icon: "_",
    description: "Shows the full answer length in Vocabulary mode.",
  },
  {
    key: "firstLetterBloom",
    name: "First Letter Bloom",
    cost: 14,
    icon: "🌸",
    description: "Locks the first character into the vocabulary input.",
  },
];

function Shop() {
  const { user, spendCoins, setUserData, purchaseHint, getHintCount, purchasePremium } =
    useContext(UserContext);

  const guestBlockedMessage = "Please login or create account.";
  const [showQR, setShowQR] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);
  const [loadingPurchase, setLoadingPurchase] = useState(false);
  const purchaseSoundRef = useRef(null);

  const coinPackages = [
    { coins: 100, price: 60, pesos: "₱60" },
    { coins: 300, price: 180, pesos: "₱180", discount: "-10%" },
    { coins: 600, price: 300, pesos: "₱300", discount: "-17%" },
    { coins: 1500, price: 600, pesos: "₱600", discount: "-25%", popular: true },
  ];

  const premiumOptions = [
    {
      name: "Freemium Trial",
      cost: 60,
      pesos: "60 coins",
      days: 7,
      bonusCoins: 100,
      features: ["Ad-free for 7 days", "100 bonus coins", "Exclusive items"],
    },
    {
      name: "Monthly Premium",
      cost: 299,
      pesos: "299 coins",
      days: 30,
      bonusCoins: 0,
      features: ["Ad-free experience", "Exclusive shop items", "Priority support"],
      popular: true,
    },
  ];

  const exclusiveItems = [
    { name: "Golden Badge", cost: 250, icon: "🏆" },
    { name: "Neon Glow Theme", cost: 500, icon: "✨" },
    { name: "Arcade Multiplier (2x)", cost: 750, icon: "⚡" },
  ];

  const flashMessage = (message) => {
    setPurchaseSuccess(message);
    setTimeout(() => setPurchaseSuccess(null), 3000);
  };

  const playPurchaseSound = () => {
    try {
      if (!purchaseSoundRef.current) {
        purchaseSoundRef.current = new Audio("/maney.m4a");
        purchaseSoundRef.current.preload = "auto";
        purchaseSoundRef.current.volume = 1;
      }

      purchaseSoundRef.current.pause();
      purchaseSoundRef.current.currentTime = 0;

      const playPromise = purchaseSoundRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } catch (error) {
      console.log("Purchase sound error:", error);
    }
  };

  const handleCoinPurchase = (pkg) => {
    if (user.isGuest || !user.loggedIn) {
      flashMessage(`❌ ${guestBlockedMessage}`);
      return;
    }

    setShowQR(pkg);
  };

  const confirmCoinPurchase = async (pkg) => {
    const token = localStorage.getItem("token");

    if (!token || user.isGuest || !user.loggedIn) {
      flashMessage(`❌ ${guestBlockedMessage}`);
      return;
    }

    try {
      setLoadingPurchase(true);

      const response = await fetch(apiUrl("/buy-coins"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          coins_bought: pkg.coins,
          amount: pkg.price,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        flashMessage(`❌ ${data.message || "Failed to buy coins"}`);
        return;
      }

      if (data.user) {
        setUserData(data.user);
      } else {
        setUserData({ coins: user.coins + pkg.coins });
      }

      playPurchaseSound();
      flashMessage(`+${pkg.coins} coins purchased and saved! 🎉`);
      setShowQR(null);
    } catch (error) {
      console.error("BUY COINS ERROR:", error);
      flashMessage("❌ Cannot connect to backend server.");
    } finally {
      setLoadingPurchase(false);
    }
  };

  const handlePremiumPurchase = async (option) => {
    if (user.isGuest || !user.loggedIn) {
      flashMessage(`❌ ${guestBlockedMessage}`);
      return;
    }

    if (user.coins < option.cost) {
      flashMessage("❌ Not enough coins for subscription.");
      return;
    }

    try {
      await purchasePremium(option);
      playPurchaseSound();
      flashMessage(`${option.name} activated and saved! 🎉`);
    } catch (error) {
      console.error("PREMIUM PURCHASE ERROR:", error);
      flashMessage(`❌ ${error.message || "Failed to activate premium"}`);
    }
  };

  const handleExclusiveItemPurchase = (item) => {
    const success = spendCoins(item.cost, "purchase_exclusive_item", { itemName: item.name });

    if (success) {
      playPurchaseSound();
      flashMessage(`Purchased ${item.name}! ${item.icon}`);
    } else {
      flashMessage(user.isGuest ? `❌ ${guestBlockedMessage}` : "❌ Not enough coins!");
    }
  };

  const handleHintPurchase = (item) => {
    const purchased = purchaseHint(item.key, item.cost, 1);

    if (!purchased) {
      flashMessage(user.isGuest ? `❌ ${guestBlockedMessage}` : "❌ Not enough coins for that hint.");
      return;
    }

    playPurchaseSound();
    flashMessage(`Purchased ${item.name}! ${item.icon}`);
  };

  const premiumIsActive = Boolean(user.premium);

  return (
    <div className="space-y-5 md:space-y-7">
      <Card title="💰 Your Balance">
        <div className="text-center rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-400/20 p-3 sm:p-4">
          <p className="text-4xl sm:text-5xl md:text-6xl font-black text-yellow-300 drop-shadow-[0_0_16px_rgba(250,204,21,0.35)]">
            {user.coins}
          </p>
          <p className="text-white/70">Coins available</p>
          {premiumIsActive && (
            <div className="mt-2 space-y-1">
              <p className="text-sm text-purple-300 font-semibold">🌟 Premium Member</p>
              <p className="text-xs text-white/70">Tier: {user.premiumTier || "premium"}</p>
              {user.premiumExpiry && (
                <p className="text-xs text-white/55">
                  Ends: {new Date(user.premiumExpiry).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      </Card>

      <Card title="🛍️ Hint Arsenal">
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {hintProducts.map((item) => (
            <div
              key={item.key}
              className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-900/20 to-fuchsia-900/15 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
            >
              <p className="text-3xl mb-2">{item.icon}</p>
              <p className="font-black text-white text-sm md:text-base">{item.name}</p>
              <p className="mt-2 text-xs text-white/65 min-h-[36px]">{item.description}</p>
              <div className="mt-3 flex items-center justify-center gap-3 text-sm">
                <span className="rounded-full bg-yellow-400/10 px-3 py-1 font-bold text-yellow-300">
                  {item.cost} coins
                </span>
                <span className="rounded-full bg-cyan-400/10 px-3 py-1 font-bold text-cyan-200">
                  Owned {getHintCount(item.key)}
                </span>
              </div>
              <Button
                onClick={() => handleHintPurchase(item)}
                variant="secondary"
                className="mt-4 w-full min-h-[44px] sm:min-h-[48px] btn-3d uppercase tracking-wide"
                disabled={false}
              >
                {user.isGuest ? "Login to buy" : user.coins >= item.cost ? "Buy Hint" : "Need coins"}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {purchaseSuccess && (
        <div className="rounded-xl sm:rounded-2xl bg-green-500/20 border border-green-500/50 p-3 sm:p-4 text-center text-sm sm:text-base text-green-300 animate-pulse shadow-[0_10px_30px_rgba(34,197,94,0.2)]">
          {purchaseSuccess}
        </div>
      )}

      <Card title="🪙 Buy Coins">
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          {coinPackages.map((pkg, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl border p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.35)] ${
                pkg.popular
                  ? "border-yellow-400 bg-gradient-to-br from-yellow-900/25 to-amber-900/20"
                  : "border-white/20 bg-gradient-to-br from-white/10 to-white/[0.04] hover:bg-white/10"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400 px-3 py-1 text-[10px] sm:text-xs font-bold text-black">
                  ⭐ POPULAR
                </div>
              )}

              {pkg.discount && (
                <div className="absolute -top-2 right-2 rounded-full bg-red-500 px-2 py-1 text-[10px] sm:text-xs font-bold text-white">
                  {pkg.discount}
                </div>
              )}

              <div className="text-center">
                <p className="text-4xl font-black text-yellow-300">{pkg.coins}</p>
                <p className="text-sm text-white/60">Coins</p>
                <p className="mt-2 text-2xl font-bold text-white">{pkg.pesos}</p>
                <Button
                  onClick={() => handleCoinPurchase(pkg)}
                  variant="primary"
                  className="mt-4 w-full min-h-[48px] sm:min-h-[52px] btn-3d text-xs uppercase tracking-wide"
                >
                  Buy Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {showQR && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <Card
            title="💳 Scan to Pay"
            className="w-full max-w-md mx-4 border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.45)]"
          >
            <div className="space-y-4">
              <div className="mx-auto h-40 w-40 sm:h-44 sm:w-44 rounded-2xl border-4 border-dashed border-white/30 flex items-center justify-center bg-white/5">
                <div className="text-center">
                  <p className="text-2xl">📱</p>
                  <p className="text-xs text-white/60 mt-2">QR Code Here</p>
                  <p className="text-xs text-white/60">Scan to pay {showQR.pesos}</p>
                </div>
              </div>

              <div className="rounded-lg bg-blue-900/20 border border-blue-500/30 p-3">
                <p className="text-sm text-blue-300">
                  <span className="font-semibold">Payment Method:</span> GCash / PayMaya
                </p>
                <p className="text-sm text-white/60 mt-1">Amount: {showQR.pesos}</p>
              </div>

              <Button
                onClick={() => confirmCoinPurchase(showQR)}
                className="w-full min-h-[48px] sm:min-h-[52px] btn-3d bg-green-600 hover:bg-green-700 uppercase tracking-wide"
                disabled={loadingPurchase}
              >
                {loadingPurchase ? "Saving purchase..." : "✅ Confirm Payment"}
              </Button>

              <Button
                onClick={() => setShowQR(null)}
                variant="secondary"
                className="w-full min-h-[48px] sm:min-h-[52px]"
                disabled={loadingPurchase}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Card title="👑 Premium Membership">
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          {premiumOptions.map((option, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl border p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.35)] ${
                option.popular
                  ? "border-purple-400 bg-gradient-to-br from-purple-900/25 to-indigo-900/20"
                  : "border-white/20 bg-gradient-to-br from-white/10 to-white/[0.04]"
              }`}
            >
              {option.popular && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-purple-400 px-3 py-1 text-xs font-bold text-white">
                  ⭐ BEST VALUE
                </div>
              )}

              <h3 className="text-xl font-black">{option.name}</h3>
              <p className="text-sm text-white/60 mb-3">{option.days} days</p>

              <ul className="mb-4 space-y-2 text-sm">
                {option.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/80">
                    <span className="text-green-400">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <p className="mb-3 text-2xl font-bold text-white">{option.pesos}</p>
              <Button
                onClick={() => handlePremiumPurchase(option)}
                variant="primary"
                className="w-full min-h-[48px] sm:min-h-[52px] btn-3d text-xs uppercase tracking-wide"
                disabled={false}
              >
                {user.isGuest ? "Login to buy" : user.coins >= option.cost ? "Subscribe Now" : "Need more coins"}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {user.premium && (
        <Card title="✨ Exclusive Premium Shop">
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
            {exclusiveItems.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-900/25 to-amber-900/20 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
              >
                <p className="text-3xl mb-2">{item.icon}</p>
                <p className="font-semibold text-sm mb-2">{item.name}</p>
                <p className="text-yellow-300 font-bold mb-3">{item.cost} coins</p>
                <Button
                  onClick={() => handleExclusiveItemPurchase(item)}
                  variant="secondary"
                  className="w-full min-h-[44px] sm:min-h-[48px] text-xs btn-3d uppercase tracking-wide"
                  disabled={false}
                >
                  {user.coins >= item.cost ? "Buy" : "Need coins"}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default Shop;