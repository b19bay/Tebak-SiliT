import { useEffect, useState } from "react";

export default function Home() {
  const [target, setTarget] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [best, setBest] = useState(() => {
    if (typeof window !== "undefined") return Number(localStorage.getItem("best") || 999);
    return 999;
  });

  // Ready signal → hide splash screen di host Farcaster
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      try {
        const { sdk } = await import("@farcaster/miniapp-sdk");
        await sdk.actions.ready();
      } catch (e) {
        console.warn("MiniApp SDK tidak tersedia di browser biasa:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const submitGuess = async () => {
    const g = parseInt(guess, 10);
    if (!g || g < 1 || g > 100) {
      setMessage("Masukkan angka antara 1 - 100");
      return;
    }
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (g === target) {
      setMessage(`💥 Benar! Kamu menebak dalam ${newAttempts} percobaan.`);
      if (newAttempts < best) {
        setBest(newAttempts);
        localStorage.setItem("best", String(newAttempts));
      }

      try {
        const { sdk } = await import("@farcaster/miniapp-sdk");
        await sdk.actions.composeCast({
          text: `Aku menebak angka ${target} dalam ${newAttempts} percobaan! 🎮 Coba TebakAngka 👉 ${process.env.NEXT_PUBLIC_URL}`,
          embeds: [process.env.NEXT_PUBLIC_URL]
        });
      } catch (e) {
        console.warn("composeCast gagal:", e);
      }
    } else if (g < target) {
      setMessage("Terlalu kecil 🔻");
    } else {
      setMessage("Terlalu besar 🔺");
    }
  };

  const reset = () => {
    setTarget(Math.floor(Math.random() * 100) + 1);
    setGuess("");
    setMessage("");
    setAttempts(0);
  };

  return (
    <main style={{ padding: 20, fontFamily: "Inter, system-ui" }}>
      <h1>TebakAngka 🎯</h1>
      <p>Tebak angka antara <strong>1</strong> sampai <strong>100</strong>.</p>

      <div style={{ marginTop: 12 }}>
        <input
          type="number"
          min="1"
          max="100"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Masukkan tebakan"
        />
        <button onClick={submitGuess} style={{ marginLeft: 8 }}>Tebak</button>
        <button onClick={reset} style={{ marginLeft: 8 }}>Reset</button>
      </div>

      <p style={{ marginTop: 12 }}>{message}</p>
      <p>Percobaan: {attempts} · Best: {best === 999 ? "-" : best}</p>
    </main>
  );
}
