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
    deliveryIncluded: 75000,   // incluse d’office
    transport: 425000,         // ajouté d’office
    profitPerSalon: 500000,    // ajouté d’office
  },
  carpet: { pricePerSqm: 13000, delivery: 75000 },
  curtain: { dubai: 6000, quality2: 4500, quality3: 4000, delivery: 75000 },
};

const STD_MATTRESS = 1.9; // m
const MIN_MATTRESS = 1.4; // m

/* ================== SVG du salon ================== */
function SalonDiagram({ geom, smallTableCount, bigTableCount, depth = 0.7 }) {
  // Tout est calculé en mètres puis converti en px (scale)
  const { widthPx, heightPx, scale, rects, coinSquares, tables } = useMemo(() => {
    const sd = depth; // m (épaisseur d’assise)
    const sides = geom.perSide;

    // Étendue approximative pour mise à l’échelle
    const leftLen   = (sides.find(s => s.id === "B" || s.id === "Gauche")?.len || 0);
    const rightLen  = (sides.find(s => s.id === "Droit")?.len || 0);
    const topLen    = (sides.find(s => s.id === "A" || s.id === "Central")?.len || 0);
    const widthM  = 2 + topLen;      // 2m ≈ coins
    const heightM = 2 + Math.max(leftLen, rightLen);

    const maxW = 680, maxH = 420;
    const scale = Math.min(maxW / widthM, maxH / heightM);

    const rects = [];
    const coinSquares = [];
    const tables = [];

    // Helpers (en mètres)
    const pushHorizontal = (xStart, yStart, segments) => {
      let x = xStart;
      segments.forEach((seg, i) => {
        rects.push({ xm: x, ym: yStart, wm: seg, hm: sd, label: i + 1 });
        x += seg;
      });
    };
    const pushVertical = (xStart, yStart, segments) => {
      let y = yStart;
      segments.forEach((seg, i) => {
        rects.push({ xm: xStart, ym: y, wm: sd, hm: seg, label: i + 1 });
        y += seg;
      });
    };

    // ===== Coins & segments =====
    if (geom.forme === "L") {
      const sideA = sides.find(s => s.id === "A");       // horizontal
      const sideB = sides.find(s => s.id === "B");       // vertical

      // Coins 1x1 (en mètres)
      coinSquares.push({ xm: 0, ym: 0, sm: 1 });

      // A : de x=1 à x=1+effective, y=0
      pushHorizontal(1, 0, sideA?.segments || []);
      // B : de y=1 à y=1+effective, x=0
      pushVertical(0, 1, sideB?.segments || []);

      // ===== Tables (positions en m, centrées dans l’angle) =====
      const centers = [
        { xm: 1 + 0.7, ym: 1 + 0.7 },
        { xm: 1 + 1.5, ym: 1 + 0.7 },
        { xm: 1 + 0.7, ym: 1 + 1.5 },
        { xm: 1 + 1.5, ym: 1 + 1.5 },
      ];
      let placed = 0;
      for (let i = 0; i < bigTableCount && placed < centers.length; i++, placed++) {
        tables.push({ type: "big", ...centers[placed] });
      }
      for (let i = 0; i < smallTableCount && placed < centers.length; i++, placed++) {
        tables.push({ type: "small", ...centers[placed] });
      }
    } else {
      const sideG = sides.find(s => s.id === "Gauche");  // vertical gauche
      const sideC = sides.find(s => s.id === "Central"); // horizontal haut
      const sideD = sides.find(s => s.id === "Droit");   // vertical droit

      // Deux coins : (0,0) et (1 + central.effective, 0)
      const effC = Math.max(0, sideC?.effective || 0);
      coinSquares.push({ xm: 0, ym: 0, sm: 1 });
      coinSquares.push({ xm: 1 + effC, ym: 0, sm: 1 });

      // Central : horizontal entre les deux coins
      pushHorizontal(1, 0, sideC?.segments || []);
      // Gauche : vertical sous le coin gauche
      pushVertical(0, 1, sideG?.segments || []);
      // Droit : vertical sous le bord interne du coin droit
      pushVertical(1 + effC, 1, sideD?.segments || []);

      // ===== Tables (au centre du U) =====
      const depthMax = Math.max(sideG?.effective || 0, sideD?.effective || 0);
      const cxBase = 1 + effC / 2;
      const cyBase = 1 + Math.min(1.3, depthMax / 2);

      const grid = [
        { xm: cxBase - 0.8, ym: cyBase },
        { xm: cxBase,       ym: cyBase },
        { xm: cxBase + 0.8, ym: cyBase },
        { xm: cxBase,       ym: cyBase + 0.8 },
      ];
      let placed = 0;
      for (let i = 0; i < bigTableCount && placed < grid.length; i++, placed++) {
        tables.push({ type: "big", ...grid[placed] });
      }
      for (let i = 0; i < smallTableCount && placed < grid.length; i++, placed++) {
        tables.push({ type: "small", ...grid[placed] });
      }
    }

    const widthPx = Math.min(maxW, widthM * scale + 8);
    const heightPx = Math.min(maxH, heightM * scale + 8);

    return { widthPx, heightPx, scale, rects, coinSquares, tables };
  }, [geom, smallTableCount, bigTableCount, depth]);

  return (
    <svg width={widthPx} height={heightPx} className="rounded-md bg-orange-50/40 border border-orange-100 mx-auto">
      {/* Coins */}
      {coinSquares.map((c, i) => (
        <rect key={`c-${i}`} x={c.xm * scale} y={c.ym * scale} width={c.sm * scale} height={c.sm * scale}
              fill="#FED7AA" stroke="#FB923C" strokeWidth="2" opacity="0.95" />
      ))}
      {/* Matelas : segments consécutifs sans espace */}
      {rects.map((r, i) => (
        <g key={`m-${i}`}>
          <rect x={r.xm * scale} y={r.ym * scale} width={r.wm * scale} height={r.hm * scale}
                rx="6" ry="6" fill="#FFEDD5" stroke="#FB923C" strokeWidth="2" />
          <text x={(r.xm + r.wm / 2) * scale} y={(r.ym + r.hm / 2) * scale}
                textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#9A3412">
            {r.label}
          </text>
        </g>
      ))}
      {/* Tables */}
      {tables.map((t, i) =>
        t.type === "small" ? (
          <g key={`ts-${i}`}>
            <circle cx={t.xm * scale} cy={t.ym * scale} r={0.30 * scale} fill="#FDE68A" stroke="#F59E0B" strokeWidth="3" />
            <text x={t.xm * scale} y={t.ym * scale + 4} textAnchor="middle" fontSize="11" fill="#92400E">Table S</text>
          </g>
        ) : (
          <g key={`tb-${i}`}>
            <rect x={(t.xm - 0.40) * scale} y={(t.ym - 0.40) * scale} width={0.80 * scale} height={0.80 * scale}
                  rx="10" fill="#FDE68A" stroke="#F59E0B" strokeWidth="3" />
            <text x={t.xm * scale} y={t.ym * scale + 4} textAnchor="middle" fontSize="11" fill="#92400E">Table G</text>
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
    shape: "L",     // "L" ou "U"
    sideA_m: 4,     // L: côté A / U: gauche
    sideB_m: 3,     // L: côté B / U: central (longueur totale)
    sideC_m: 0,     // U: droit
    smallTableCount: 0,
    bigTableCount: 0,
  });

  // ---- Tapis & Rideaux (minimal)
  const [carpetData, setCarpetData] = useState({ length: 3, width: 2 });
  const [curtainData, setCurtainData] = useState({ length: 2.5, width: 3, quality: "dubai" });

  // ---- Client
  const [customerInfo, setCustomerInfo] = useState({ name: "", email: "", phone: "", address: "", notes: "" });

  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------- Algorithme de découpe sans matelas < 1,40 m ---------- */
  const splitIntoMattresses = (effectiveLen) => {
    if (effectiveLen <= 0) return [];

    // cas simple : longueur entre 1.40 et 1.90 -> un seul matelas
    if (effectiveLen < STD_MATTRESS) {
      return effectiveLen >= MIN_MATTRESS ? [effectiveLen] : [];
    }

    // tant que > 1.9, on pré-alloue des 1.9
    const nStd = Math.floor(effectiveLen / STD_MATTRESS);
    const remainder = effectiveLen - nStd * STD_MATTRESS;

    if (remainder >= MIN_MATTRESS) {
      // on garde le reliquat comme dernier matelas
      return Array(nStd).fill(STD_MATTRESS).concat([remainder]);
    }

    // sinon, on répartit proport. le reliquat sur les nStd pièces
    const delta = remainder / nStd;
    return Array.from({ length: nStd }, () => STD_MATTRESS + delta);
  };

  /* ---------- Géométrie salon L / U ---------- */
  const calcSalonGeometry = (data) => {
    const COIN_M = 1;
    const isL = data.shape === "L";

    const sides = isL
      ? [
          { id: "A", len: Math.max(0, Number(data.sideA_m || 0)), coinsOnSide: 1 },
          { id: "B", len: Math.max(0, Number(data.sideB_m || 0)), coinsOnSide: 1 },
        ]
      : [
          { id: "Gauche",  len: Math.max(0, Number(data.sideA_m || 0)), coinsOnSide: 1 },
          { id: "Central", len: Math.max(0, Number(data.sideB_m || 0)), coinsOnSide: 2 },
          { id: "Droit",   len: Math.max(0, Number(data.sideC_m || 0)), coinsOnSide: 1 },
        ];

    const perSide = sides.map((s) => {
      const effective = Math.max(0, s.len - s.coinsOnSide * COIN_M);
      const segments = splitIntoMattresses(effective); // somme = effective, sans espace
      return { ...s, effective, segments, mattresses: segments.length };
    });

    const corners = isL ? 1 : 2;
    const arms = 2;
    const mattressCount = perSide.reduce((acc, s) => acc + s.mattresses, 0);

    return { forme: data.shape, corners, arms, mattressCount, perSide };
  };

  /* ---------- Calculs (affichage total uniquement) ---------- */
  const calculateSalonPrice = () => {
    const geom = calcSalonGeometry(salonData);

    const mattressTotal = geom.mattressCount * PRICES.salon.mattress;
    const cornerTotal   = geom.corners       * PRICES.salon.corner;
    const armsTotal     = geom.arms          * PRICES.salon.arms;
    const smallTableTot = salonData.smallTableCount * PRICES.salon.smallTable;
    const bigTableTot   = salonData.bigTableCount   * PRICES.salon.bigTable;

    const total =
      mattressTotal +
      cornerTotal +
      armsTotal +
      smallTableTot +
      bigTableTot +
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
            <p className="text-muted-foreground">
              Configurez votre projet, visualisez le plan de matelas et obtenez le total.
            </p>
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
                        <Input type="number" step="0.1" min="0"
                          value={salonData.sideA_m}
                          onChange={(e) => setSalonData({ ...salonData, sideA_m: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Côté B (m)</Label>
                        <Input type="number" step="0.1" min="0"
                          value={salonData.sideB_m}
                          onChange={(e) => setSalonData({ ...salonData, sideB_m: Number(e.target.value) })}
                        />
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
                        <Input type="number" step="0.1" min="0"
                          value={salonData.sideA_m}
                          onChange={(e) => setSalonData({ ...salonData, sideA_m: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Central (m)</Label>
                        <Input type="number" step="0.1" min="0"
                          value={salonData.sideB_m}
                          onChange={(e) => setSalonData({ ...salonData, sideB_m: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Droit (m)</Label>
                        <Input type="number" step="0.1" min="0"
                          value={salonData.sideC_m}
                          onChange={(e) => setSalonData({ ...salonData, sideC_m: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Nombre de tables */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Petites tables (0–3)</Label>
                      <Select
                        value={String(salonData.smallTableCount)}
                        onValueChange={(v) => setSalonData({ ...salonData, smallTableCount: Number(v) })}
                      >
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
                      <Select
                        value={String(salonData.bigTableCount)}
                        onValueChange={(v) => setSalonData({ ...salonData, bigTableCount: Number(v) })}
                      >
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
                  <CardDescription>Plan de matelas et total</CardDescription>
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
