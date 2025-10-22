import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calculator, Send, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_TITLE, APP_LOGO } from "@/const";

/* ------------------ Barèmes internes (masqués) ------------------ */
const PRICES = {
  salon: {
    mattress: 130000,
    corner: 130000,
    arms: 96000,
    smallTable: 50000,
    bigTable: 130000,
    deliveryIncluded: 75000,
    transport: 425000,
    profitPerSalon: 500000,
  },
  carpet: { pricePerSqm: 13000, delivery: 75000 },
  curtain: { dubai: 6000, quality2: 4500, quality3: 4000, delivery: 75000 },
};

const STD = 1.9;
const MIN = 1.4;
const MAX = 2.4;
const COIN_STD = 1.0;
const COIN_MIN = 0.7;
const SEAT_DEPTH = 0.7; // m

/* ================== Outils découpe ================== */
/** Retourne k tel que k*MIN <= L <= k*MAX, proche de L/STD */
function chooseK(L) {
  if (L < MIN) return 0;
  const kMin = Math.ceil(L / MAX);
  const kMax = Math.floor(L / MIN);
  if (kMin > kMax) return 0;
  let k = Math.round(L / STD);
  k = Math.max(kMin, Math.min(k, kMax));
  if (k <= 0) k = kMin; // garde au moins kMin
  return k;
}

/** Distribue L en k segments dans [MIN, MAX], somme exacte = L (remplissage "eau") */
function distributeSegments(L, k) {
  if (k <= 0) return [];
  // Base à MIN
  const segs = Array(k).fill(MIN);
  let rem = L - k * MIN; // >= 0 par construction

  // Étape 1 : tendre vers STD d'abord
  const targetRaise = Math.max(0, Math.min(STD - MIN, MAX - MIN)); // typiquement 0.5
  for (let i = 0; i < k && rem > 1e-9; i++) {
    const add = Math.min(targetRaise, rem);
    segs[i] += add;
    rem -= add;
  }

  // Étape 2 : si reste encore, monter uniformément jusqu'à MAX
  let i = 0;
  while (rem > 1e-9) {
    const cap = MAX - segs[i];
    if (cap > 0) {
      const add = Math.min(cap, rem);
      segs[i] += add;
      rem -= add;
    }
    i = (i + 1) % k;
    // sécurité anti-boucle : si rien n'a pu être ajouté dans un tour, on casse
    if (i === 0 && segs.every(s => Math.abs(s - MAX) < 1e-9)) break;
  }

  // Ajustement faible pour la somme exacte (flottants)
  const diff = L - segs.reduce((a, b) => a + b, 0);
  if (Math.abs(diff) > 1e-8) {
    for (let j = 0; j < k; j++) {
      const room = diff > 0 ? (MAX - segs[j]) : (segs[j] - MIN);
      if ((diff > 0 && room > 0) || (diff < 0 && room > 0)) {
        const add = Math.sign(diff) * Math.min(Math.abs(diff), room);
        segs[j] += add;
        break;
      }
    }
  }
  // Clamp final
  for (let j = 0; j < k; j++) {
    segs[j] = Math.max(MIN, Math.min(MAX, segs[j]));
  }
  return segs;
}

/* ================== Résolution des coins & géométrie ================== */
/**
 * Pour un L : un coin (taille c ∈ [0.7,1.0]).
 * Pour un U : deux coins égaux (c à gauche = c à droite ∈ [0.7,1.0]).
 * On cherche le plus grand c possible (le moins de réduction), qui permet des segments valides.
 */
function solveGeometry(shape, lengths) {
  if (shape === "L") {
    const lenA = lengths.sideA_m;
    const lenB = lengths.sideB_m;

    for (let c = COIN_STD; c >= COIN_MIN - 1e-9; c -= 0.01) {
      const effA = Math.max(0, lenA - c);
      const effB = Math.max(0, lenB - c);

      const kA = chooseK(effA);
      const kB = chooseK(effB);
      if (kA === 0 && effA >= MIN) continue;
      if (kB === 0 && effB >= MIN) continue;

      const segA = kA ? distributeSegments(effA, kA) : [];
      const segB = kB ? distributeSegments(effB, kB) : [];

      // vérif somme exacte
      if (Math.abs(effA - segA.reduce((a, b) => a + b, 0)) < 1e-6 &&
          Math.abs(effB - segB.reduce((a, b) => a + b, 0)) < 1e-6) {
        return {
          coinSize: c,
          perSide: [
            { id: "A", len: lenA, effective: effA, segments: segA, coinsOnSide: 1 },
            { id: "B", len: lenB, effective: effB, segments: segB, coinsOnSide: 1 },
          ],
          corners: 1,
          arms: 2,
          forme: "L",
        };
      }
    }
  } else {
    const lenG = lengths.sideA_m; // gauche
    const lenC = lengths.sideB_m; // central
    const lenD = lengths.sideC_m; // droit

    for (let c = COIN_STD; c >= COIN_MIN - 1e-9; c -= 0.01) {
      const effG = Math.max(0, lenG - c);
      const effC = Math.max(0, lenC - 2 * c);
      const effD = Math.max(0, lenD - c);

      const kG = chooseK(effG);
      const kC = chooseK(effC);
      const kD = chooseK(effD);

      if ((kG === 0 && effG >= MIN) || (kC === 0 && effC >= MIN) || (kD === 0 && effD >= MIN)) {
        continue; // pas faisable avec ce c
      }

      const segG = kG ? distributeSegments(effG, kG) : [];
      const segC = kC ? distributeSegments(effC, kC) : [];
      const segD = kD ? distributeSegments(effD, kD) : [];

      const ok =
        Math.abs(effG - segG.reduce((a, b) => a + b, 0)) < 1e-6 &&
        Math.abs(effC - segC.reduce((a, b) => a + b, 0)) < 1e-6 &&
        Math.abs(effD - segD.reduce((a, b) => a + b, 0)) < 1e-6;

      if (ok) {
        return {
          coinSize: c,
          perSide: [
            { id: "Gauche",  len: lenG, effective: effG, segments: segG, coinsOnSide: 1 },
            { id: "Central", len: lenC, effective: effC, segments: segC, coinsOnSide: 2 },
            { id: "Droit",   len: lenD, effective: effD, segments: segD, coinsOnSide: 1 },
          ],
          corners: 2,
          arms: 2,
          forme: "U",
        };
      }
    }
  }

  // Si aucune solution, retourner géométrie vide
  return {
    coinSize: COIN_STD,
    perSide: [],
    corners: shape === "L" ? 1 : 2,
    arms: 2,
    forme: shape,
  };
}

/* ================== SVG du salon (échelle serrée) ================== */
function SalonDiagram({ geom, smallTableCount, bigTableCount }) {
  const { widthPx, heightPx, scale, rects, coins, tables } = useMemo(() => {
    const sd = SEAT_DEPTH; // m
    const c = geom.coinSize;

    // Longueurs utiles par côté
    const get = (id) => geom.perSide.find(s => s.id === id);

    let effA=0, effB=0, effG=0, effC=0, effD=0;
    if (geom.forme === "L") {
      effA = get("A")?.effective || 0;
      effB = get("B")?.effective || 0;
    } else {
      effG = get("Gauche")?.effective || 0;
      effC = get("Central")?.effective || 0;
      effD = get("Droit")?.effective || 0;
    }

    // Dimensions du canevas (m) — marges légères
    let widthM, heightM;
    if (geom.forme === "L") {
      widthM  = c + effA + 0.25;
      heightM = c + effB + 0.25;
    } else {
      widthM  = c + effC + c + 0.25;
      heightM = c + Math.max(effG, effD) + 0.25;
    }

    const maxW = 680, maxH = 420;
    const scale = Math.min(maxW / widthM, maxH / heightM);

    const rects = [];
    const coins = [];
    const tables = [];

    // Helpers
    const pushHorizontal = (xStart, yStart, segments) => {
      let x = xStart;
      segments.forEach((seg, i) => {
        rects.push({ x: x * scale, y: yStart * scale, w: seg * scale, h: sd * scale, label: i + 1 });
        x += seg;
      });
    };
    const pushVertical = (xStart, yStart, segments) => {
      let y = yStart;
      segments.forEach((seg, i) => {
        rects.push({ x: xStart * scale, y: y * scale, w: sd * scale, h: seg * scale, label: i + 1 });
        y += seg;
      });
    };

    if (geom.forme === "L") {
      coins.push({ x: 0, y: 0, s: c * scale });
      pushHorizontal(c, 0, get("A")?.segments || []);
      pushVertical(0, c, get("B")?.segments || []);

      // Tables près de l'angle
      const centers = [
        { x: (c + 0.7) * scale, y: (c + 0.7) * scale },
        { x: (c + 1.5) * scale, y: (c + 0.7) * scale },
        { x: (c + 0.7) * scale, y: (c + 1.5) * scale },
        { x: (c + 1.5) * scale, y: (c + 1.5) * scale },
      ];
      let p = 0;
      for (let i = 0; i < bigTableCount && p < centers.length; i++, p++) tables.push({ type: "big", ...centers[p] });
      for (let i = 0; i < smallTableCount && p < centers.length; i++, p++) tables.push({ type: "small", ...centers[p] });
    } else {
      // Coins
      coins.push({ x: 0, y: 0, s: c * scale });
      coins.push({ x: (c + effC) * scale, y: 0, s: c * scale });

      // Central (horizontal)
      pushHorizontal(c, 0, get("Central")?.segments || []);
      // Gauche (vertical)
      pushVertical(0, c, get("Gauche")?.segments || []);
      // Droit (vertical)
      pushVertical(c + effC, c, get("Droit")?.segments || []);

      // Tables centrées dans le U
      const depthMax = Math.max(effG, effD);
      const cx = (c + effC / 2) * scale;
      const cy = (c + Math.min(1.3, depthMax / 2)) * scale;
      const grid = [
        { x: cx - 0.8 * scale, y: cy },
        { x: cx,               y: cy },
        { x: cx + 0.8 * scale, y: cy },
        { x: cx,               y: cy + 0.8 * scale },
      ];
      let p = 0;
      for (let i = 0; i < bigTableCount && p < grid.length; i++, p++) tables.push({ type: "big", ...grid[p] });
      for (let i = 0; i < smallTableCount && p < grid.length; i++, p++) tables.push({ type: "small", ...grid[p] });
    }

    const widthPx = Math.min(maxW, widthM * scale + 4);
    const heightPx = Math.min(maxH, heightM * scale + 4);
    return { widthPx, heightPx, scale, rects, coins, tables };
  }, [geom, smallTableCount, bigTableCount]);

  return (
    <svg width={widthPx} height={heightPx} className="rounded-md bg-orange-50/40 border border-orange-100 mx-auto">
      {coins.map((c, i) => (
        <rect key={`c-${i}`} x={c.x} y={c.y} width={c.s} height={c.s} fill="#FED7AA" stroke="#FB923C" strokeWidth="2" opacity="0.95" />
      ))}
      {rects.map((r, i) => (
        <g key={`m-${i}`}>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="6" ry="6" fill="#FFEDD5" stroke="#FB923C" strokeWidth="2" />
          <text x={r.x + r.w/2} y={r.y + r.h/2} textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#9A3412">{r.label}</text>
        </g>
      ))}
      {tables.map((t, i) =>
        t.type === "small" ? (
          <g key={`ts-${i}`}>
            <circle cx={t.x} cy={t.y} r={0.30 * 100} fill="#FDE68A" stroke="#F59E0B" strokeWidth="3" />
            <text x={t.x} y={t.y + 4} textAnchor="middle" fontSize="11" fill="#92400E">Table S</text>
          </g>
        ) : (
          <g key={`tb-${i}`}>
            <rect x={t.x - 0.40 * 100} y={t.y - 0.40 * 100} width={0.80 * 100} height={0.80 * 100} rx="10"
                  fill="#FDE68A" stroke="#F59E0B" strokeWidth="3" />
            <text x={t.x} y={t.y + 4} textAnchor="middle" fontSize="11" fill="#92400E">Table G</text>
          </g>
        )
      )}
    </svg>
  );
}

/* ================== Page Devis ================== */
export default function QuotePage() {
  const [activeTab, setActiveTab] = useState("salon");

  // ---- Salon
  const [salonData, setSalonData] = useState({
    shape: "U",     // "L" ou "U"
    sideA_m: 6.6,   // L: côté A / U: gauche (exemple)
    sideB_m: 4.5,   // L: côté B / U: central (total, coins inclus)
    sideC_m: 5.2,   // U: droit
    smallTableCount: 2,
    bigTableCount: 1,
  });

  // ---- Tapis & Rideaux (minimal)
  const [carpetData, setCarpetData] = useState({ length: 3, width: 2 });
  const [curtainData, setCurtainData] = useState({ length: 2.5, width: 3, quality: "dubai" });

  // ---- Client
  const [customerInfo, setCustomerInfo] = useState({ name: "", email: "", phone: "", address: "", notes: "" });

  const [calculatedPrice, setCalculatedPrice] = useState(null);

  /* ---------- Géométrie (avec ajustement des coins ≥0.70 m) ---------- */
  const calcSalonGeometry = (data) => {
    return solveGeometry(data.shape, {
      sideA_m: Number(data.sideA_m || 0),
      sideB_m: Number(data.sideB_m || 0),
      sideC_m: Number(data.sideC_m || 0),
    });
  };

  /* ---------- Totaux (affiche uniquement le total) ---------- */
  const calculateSalonPrice = () => {
    const geom = calcSalonGeometry(salonData);
    const mattressCount = geom.perSide.reduce((n, s) => n + s.segments.length, 0);

    const total =
      mattressCount * PRICES.salon.mattress +
      geom.corners * PRICES.salon.corner +
      geom.arms * PRICES.salon.arms +
      salonData.smallTableCount * PRICES.salon.smallTable +
      salonData.bigTableCount * PRICES.salon.bigTable +
      PRICES.salon.deliveryIncluded +
      PRICES.salon.transport +
      PRICES.salon.profitPerSalon;

    return { type: "salon", breakdown: { geom }, total };
  };

  const calculateCarpetPrice = () => {
    const area = carpetData.length * carpetData.width;
    const total = area * PRICES.carpet.pricePerSqm + PRICES.carpet.delivery;
    return { type: "carpet", breakdown: { area }, total };
  };

  const calculateCurtainPrice = () => {
    const area = curtainData.length * curtainData.width;
    const pricePerSqm = PRICES.curtain[curtainData.quality];
    const total = area * pricePerSqm + PRICES.curtain.delivery;
    return { type: "curtain", breakdown: { area, quality: curtainData.quality }, total };
  };

  const handleCalculate = () => {
    const r =
      activeTab === "salon"
        ? calculateSalonPrice()
        : activeTab === "carpet"
        ? calculateCarpetPrice()
        : calculateCurtainPrice();

    setCalculatedPrice(r);
    toast.success("Calcul effectué.");
  };

  const handleSubmitQuote = () => {
    if (!customerInfo.name || !customerInfo.phone) {
      toast.error("Veuillez renseigner votre nom et téléphone");
      return;
    }
    if (!calculatedPrice) {
      toast.error("Veuillez d'abord calculer le devis");
      return;
    }
    toast.success("Demande de devis envoyée. Nous vous contacterons bientôt.");
    setCustomerInfo({ name: "", email: "", phone: "", address: "", notes: "" });
    setCalculatedPrice(null);
  };

  const formatPrice = (price) => new Intl.NumberFormat("fr-FR").format(price) + " FCFA";

  /* ------------------ UI ------------------ */
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt="Decor Mali" className="h-8 w-8 rounded-full ring-1 ring-muted object-contain" />
            <span className="font-semibold">{APP_TITLE}</span>
          </div>
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </Link>
        </div>
      </header>

      <main className="container py-12 flex-1">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Calculateur de Devis</h1>
            <p className="text-muted-foreground">Configurez votre projet, visualisez le plan de matelas et obtenez le total.</p>
          </div>

          <Tabs defaultValue="salon" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="salon">Salon</TabsTrigger>
              <TabsTrigger value="carpet">Tapis</TabsTrigger>
              <TabsTrigger value="curtain">Rideaux</TabsTrigger>
            </TabsList>

            {/* SALON */}
            <TabsContent value="salon" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration du Salon</CardTitle>
                  <CardDescription>Forme en L ou U — longueurs en mètres</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {salonData.shape === "L" ? (
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label>Forme du salon</Label>
                        <Select value={salonData.shape} onValueChange={(v) => setSalonData({ ...salonData, shape: v })}>
                          <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="L">L</SelectItem>
                            <SelectItem value="U">U</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Côté A (m)</Label>
                        <Input type="number" step="0.1" min="0" value={salonData.sideA_m}
                          onChange={(e) => setSalonData({ ...salonData, sideA_m: Number(e.target.value) })}/>
                      </div>
                      <div className="space-y-2">
                        <Label>Côté B (m)</Label>
                        <Input type="number" step="0.1" min="0" value={salonData.sideB_m}
                          onChange={(e) => setSalonData({ ...salonData, sideB_m: Number(e.target.value) })}/>
                      </div>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <Label>Forme du salon</Label>
                        <Select value={salonData.shape} onValueChange={(v) => setSalonData({ ...salonData, shape: v })}>
                          <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="L">L</SelectItem>
                            <SelectItem value="U">U</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Gauche (m)</Label>
                        <Input type="number" step="0.1" min="0" value={salonData.sideA_m}
                          onChange={(e) => setSalonData({ ...salonData, sideA_m: Number(e.target.value) })}/>
                      </div>
                      <div className="space-y-2">
                        <Label>Central (m)</Label>
                        <Input type="number" step="0.1" min="0" value={salonData.sideB_m}
                          onChange={(e) => setSalonData({ ...salonData, sideB_m: Number(e.target.value) })}/>
                      </div>
                      <div className="space-y-2">
                        <Label>Droit (m)</Label>
                        <Input type="number" step="0.1" min="0" value={salonData.sideC_m}
                          onChange={(e) => setSalonData({ ...salonData, sideC_m: Number(e.target.value) })}/>
                      </div>
                    </div>
                  )}

                  {/* Nombre de tables */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Petites tables (0–3)</Label>
                      <Select value={String(salonData.smallTableCount)} onValueChange={(v) => setSalonData({ ...salonData, smallTableCount: Number(v) })}>
                        <SelectTrigger><SelectValue placeholder="0" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Grandes tables (0–3)</Label>
                      <Select value={String(salonData.bigTableCount)} onValueChange={(v) => setSalonData({ ...salonData, bigTableCount: Number(v) })}>
                        <SelectTrigger><SelectValue placeholder="0" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Résultat</CardTitle>
                  <CardDescription>Plan de matelas, détail par côté & total</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-3">
                    <Button onClick={handleCalculate} className="gap-2">
                      <Calculator className="w-4 h-4" /> Calculer
                    </Button>
                  </div>

                  {calculatedPrice && calculatedPrice.type === "salon" && (
                    <div className="space-y-6">
                      <SalonDiagram
                        geom={calculatedPrice.breakdown.geom}
                        smallTableCount={salonData.smallTableCount}
                        bigTableCount={salonData.bigTableCount}
                      />

                      {/* Détail des matelas par côté (sans prix) */}
                      <div className="rounded-md border p-4 text-sm space-y-3">
                        <div className="font-medium">Détail des matelas</div>
                        <div className="text-muted-foreground">
                          Coin(s) utilisés : {calculatedPrice.breakdown.geom.coinSize.toFixed(2)} m
                        </div>
                        {calculatedPrice.breakdown.geom.perSide.map((side) => (
                          <div key={side.id} className="flex flex-wrap items-center gap-2">
                            <span className="w-28">{side.id}</span>
                            <span className="text-muted-foreground">utile : {side.effective.toFixed(2)} m</span>
                            <span className="mx-1">•</span>
                            <span>{side.segments.length} matelas :</span>
                            {side.segments.map((len, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-orange-50 border border-orange-100">
                                {len.toFixed(2)} m
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>

                      <div className="rounded-lg bg-orange-50 border border-orange-100 p-4 text-right">
                        <div className="text-2xl font-extrabold text-orange-700">
                          Total : {formatPrice(calculatedPrice.total)}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAPIS */}
            <TabsContent value="carpet" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration du Tapis</CardTitle>
                  <CardDescription>Surface et total</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Longueur (m)</Label>
                      <Input type="number" step="0.1" min="0"
                        value={carpetData.length}
                        onChange={(e) => setCarpetData({ ...carpetData, length: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Largeur (m)</Label>
                      <Input type="number" step="0.1" min="0"
                        value={carpetData.width}
                        onChange={(e) => setCarpetData({ ...carpetData, width: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleCalculate} className="gap-2">
                      <Calculator className="w-4 h-4" /> Calculer
                    </Button>
                  </div>

                  {calculatedPrice && calculatedPrice.type === "carpet" && (
                    <div className="rounded-lg bg-orange-50 border border-orange-100 p-4 text-right">
                      <div className="text-2xl font-extrabold text-orange-700">
                        Total : {formatPrice(calculatedPrice.total)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* RIDEAUX */}
            <TabsContent value="curtain" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration des Rideaux</CardTitle>
                  <CardDescription>Dimensions, qualité et total</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label>Hauteur (m)</Label>
                      <Input type="number" step="0.1" min="0"
                        value={curtainData.length}
                        onChange={(e) => setCurtainData({ ...curtainData, length: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Largeur (m)</Label>
                      <Input type="number" step="0.1" min="0"
                        value={curtainData.width}
                        onChange={(e) => setCurtainData({ ...curtainData, width: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Qualité</Label>
                      <Select value={curtainData.quality} onValueChange={(v) => setCurtainData({ ...curtainData, quality: v })}>
                        <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dubai">Dubai</SelectItem>
                          <SelectItem value="quality2">Qualité 2</SelectItem>
                          <SelectItem value="quality3">Qualité 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleCalculate} className="gap-2">
                      <Calculator className="w-4 h-4" /> Calculer
                    </Button>
                  </div>

                  {calculatedPrice && calculatedPrice.type === "curtain" && (
                    <div className="rounded-lg bg-orange-50 border border-orange-100 p-4 text-right">
                      <div className="text-2xl font-extrabold text-orange-700">
                        Total : {formatPrice(calculatedPrice.total)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Coordonnées */}
          <Card>
            <CardHeader>
              <CardTitle>Vos coordonnées</CardTitle>
              <CardDescription>Nous vous contacterons pour finaliser l’offre</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={customerInfo.email} onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Input value={customerInfo.address} onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={customerInfo.notes} onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })} placeholder="Informations complémentaires…" />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSubmitQuote} className="gap-2">
                  <Send className="w-4 h-4" />
                  Envoyer la demande de devis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
