// ===== Pricing constants (edit here anytime) =====
const PRICING = {
  // sqft formula uses: (rampLength * 3) + (p55 * 25) + (p54 * 20) + (p44 * 16)
  newRampPerSqft: 58,
  usedRampPerSqft: 49.3,
  installPerSqft: 6,
  rentalMonthlyPerSqft: 6,
  rentalInstallRemovalPerSqft: 10,
};

// ===== Helpers =====
function num(val) {
  const n = parseFloat(val);
  return Number.isFinite(n) ? n : 0;
}

function int(val) {
  const n = parseInt(val, 10);
  return Number.isFinite(n) ? n : 0;
}

function money(v) {
  const n = Number.isFinite(v) ? v : 0;
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function round2(v) {
  return Math.round((v + Number.EPSILON) * 100) / 100;
}

// ===== DOM =====
const el = {
  rampLength: document.getElementById("rampLength"),
  p55: document.getElementById("p55"),
  p54: document.getElementById("p54"),
  p44: document.getElementById("p44"),

  totalSqft: document.getElementById("totalSqft"),
  sqftFormulaHint: document.getElementById("sqftFormulaHint"),

  newRampPrice: document.getElementById("newRampPrice"),
  newInstall: document.getElementById("newInstall"),
  newTotal: document.getElementById("newTotal"),

  usedRampPrice: document.getElementById("usedRampPrice"),
  usedInstall: document.getElementById("usedInstall"),
  usedTotal: document.getElementById("usedTotal"),

  rentalMonthly: document.getElementById("rentalMonthly"),
  rentalInstallRemoval: document.getElementById("rentalInstallRemoval"),
  rentalFirstPayment: document.getElementById("rentalFirstPayment"),
  rentalOngoing: document.getElementById("rentalOngoing"),

  resetBtn: document.getElementById("resetBtn"),
  copyBtn: document.getElementById("copyBtn"),
  copyStatus: document.getElementById("copyStatus"),
};

function calc() {
  const rampLength = num(el.rampLength.value);
  const p55 = int(el.p55.value);
  const p54 = int(el.p54.value);
  const p44 = int(el.p44.value);

  // Total Square ft = ((Total Ramp Length x 3) + (5x5 x 25) + (5x4 x 20) + (4x4 x 16))
  const totalSqft =
    (rampLength * 3) +
    (p55 * 25) +
    (p54 * 20) +
    (p44 * 16);

  const sqft = round2(totalSqft);

  // New Purchase
  const newRampPrice = sqft * PRICING.newRampPerSqft;
  const newInstall = sqft * PRICING.installPerSqft;
  const newTotal = newRampPrice + newInstall;

  // Used Purchase
  const usedRampPrice = sqft * PRICING.usedRampPerSqft;
  const usedInstall = sqft * PRICING.installPerSqft;
  const usedTotal = usedRampPrice + usedInstall;

  // Rental
  const rentalMonthly = sqft * PRICING.rentalMonthlyPerSqft;
  const rentalInstallRemoval = sqft * PRICING.rentalInstallRemovalPerSqft;
  const rentalFirstPayment = (rentalMonthly * 3) + rentalInstallRemoval;
  const rentalOngoing = rentalMonthly;

  // Update UI
  el.totalSqft.textContent = sqft.toLocaleString(undefined, { maximumFractionDigits: 2 });

  el.sqftFormulaHint.textContent =
    `Sq Ft = (Ramp Length × 3) + (5×5 × 25) + (5×4 × 20) + (4×4 × 16)`;

  el.newRampPrice.textContent = money(newRampPrice);
  el.newInstall.textContent = money(newInstall);
  el.newTotal.textContent = money(newTotal);

  el.usedRampPrice.textContent = money(usedRampPrice);
  el.usedInstall.textContent = money(usedInstall);
  el.usedTotal.textContent = money(usedTotal);

  el.rentalMonthly.textContent = money(rentalMonthly);
  el.rentalInstallRemoval.textContent = money(rentalInstallRemoval);
  el.rentalFirstPayment.textContent = money(rentalFirstPayment);
  el.rentalOngoing.textContent = money(rentalOngoing);

  return {
    rampLength,
    p55, p54, p44,
    sqft,
    newRampPrice, newInstall, newTotal,
    usedRampPrice, usedInstall, usedTotal,
    rentalMonthly, rentalInstallRemoval, rentalFirstPayment, rentalOngoing,
  };
}

// Recalc on input
["input", "change"].forEach(evt => {
  el.rampLength.addEventListener(evt, calc);
  el.p55.addEventListener(evt, calc);
  el.p54.addEventListener(evt, calc);
  el.p44.addEventListener(evt, calc);
});

el.resetBtn.addEventListener("click", () => {
  el.rampLength.value = "";
  el.p55.value = "";
  el.p54.value = "";
  el.p44.value = "";
  el.copyStatus.textContent = "";
  calc();
});

el.copyBtn.addEventListener("click", async () => {
  const r = calc();

  const text =
`Ramp Pricing Calculator

Inputs:
- Total Ramp Length (ft): ${r.rampLength}
- 5x5 Platforms: ${r.p55}
- 5x4 Platforms: ${r.p54}
- 4x4 Platforms: ${r.p44}

Total Square Ft: ${r.sqft}

New Ramp Purchase:
- New Ramp Price: ${money(r.newRampPrice)}
- Ramp Installation: ${money(r.newInstall)}
- Total New Ramp Purchase: ${money(r.newTotal)}

Used Ramp Purchase:
- Used Ramp Price: ${money(r.usedRampPrice)}
- Ramp Installation: ${money(r.usedInstall)}
- Total Used Ramp Purchase: ${money(r.usedTotal)}

Ramp Rental:
- Monthly Rental: ${money(r.rentalMonthly)}
- Used Ramp Installation and Removal: ${money(r.rentalInstallRemoval)}
- 1st Payment (3 months + install/removal): ${money(r.rentalFirstPayment)}
- Ongoing Monthly (4th Month +): ${money(r.rentalOngoing)}
`;

  try {
    await navigator.clipboard.writeText(text);
    el.copyStatus.textContent = "Copied to clipboard ✅";
  } catch (e) {
    // Fallback for older browsers
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    el.copyStatus.textContent = "Copied to clipboard ✅";
  }
});

// Initial render
calc();

