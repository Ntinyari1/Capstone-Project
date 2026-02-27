import React, { useState, useMemo } from 'react';

const ClothingAdvice = ({ temp, condition, unit, windSpeed }) => {
  const normalizedCondition = condition ? String(condition).toLowerCase() : "";

  const isRaining = normalizedCondition.includes("rain") || normalizedCondition.includes("drizzle");
  const isSnowing = normalizedCondition.includes("snow");
  const isStormy = normalizedCondition.includes("thunder") || normalizedCondition.includes("storm");
  const isFoggy =
    normalizedCondition.includes("fog") ||
    normalizedCondition.includes("mist") ||
    normalizedCondition.includes("haze") ||
    normalizedCondition.includes("smoke");

  // Convert logic to handle both Celsius and Fahrenheit for the advice
  const celsiusTemp =
    typeof temp === "number"
      ? unit === "metric"
        ? temp
        : (temp - 32) * 5 / 9
      : null;

  const options = useMemo(() => {
    if (isStormy) {
      return [
        "Stormy skies ahead. Bold Spot recommends waterproof outerwear, non-slip shoes, and avoiding loose accessories.",
        "Strong winds and rain—choose a hooded parka, water-resistant boots, and keep accessories minimal.",
      ];
    }
    if (isSnowing) {
      return [
        "Snowy conditions. Layer thermal pieces, insulated coats, and weatherproof boots from Bold Spot.",
        "Expect snow underfoot—go for padded jackets, wool scarves, and anti-slip boots.",
      ];
    }
    if (isRaining) {
      return [
        "It's raining. Grab an umbrella, a waterproof jacket, and closed shoes that can handle puddles.",
        "Light rain? A trench coat, ankle boots, and a compact umbrella keep you polished and dry.",
      ];
    }
    if (isFoggy) {
      return [
        "Low visibility and damp air. Choose warm layers in high-visibility tones so you stay both safe and stylish.",
        "Foggy vibes—think cozy knits, a bright outer layer, and sturdy sneakers.",
      ];
    }
    if (typeof windSpeed === "number" && windSpeed > 8) {
      return [
        "Windy outside. Go for fitted outer layers, secure hats, and avoid flowy pieces that might whip around.",
        "High winds—pick streamlined jackets, snug cuffs, and shoes with good grip.",
      ];
    }
    if (celsiusTemp == null) {
      return [
        "Tempus suggests flexible layering today—conditions are changing, so keep a light jacket within reach.",
        "Uncertain conditions—build a look with removable layers so you can adapt on the go.",
      ];
    }
    if (celsiusTemp > 28) {
      return [
        "Heat alert. Light cotton, breathable sneakers, and UV-protective accessories keep you cool and polished.",
        "Very warm—choose linen shirts, airy dresses, and minimal, breathable footwear.",
      ];
    }
    if (celsiusTemp > 20) {
      return [
        "Warm and comfortable. A crisp tee or blouse with relaxed trousers is a perfect Bold Spot combo.",
        "Ideal city-weather—try a lightweight shirt, chinos, and clean sneakers.",
      ];
    }
    if (celsiusTemp > 12) {
      return [
        "Mildly chilly. Layer a denim or bomber jacket over your outfit for an effortless street-ready look.",
        "Transitional temps—pair a long-sleeve tee with a light jacket and jeans.",
      ];
    }
    return [
      "Cold alert. Reach for heavy coats, knitwear, and insulated footwear to stay warm without losing your edge.",
      "Very cold—go for a padded coat, thermal layers, beanie, and gloves.",
    ];
  }, [isStormy, isSnowing, isRaining, isFoggy, windSpeed, celsiusTemp]);

  const [optionIndex, setOptionIndex] = useState(0);
  const advice = options[optionIndex] || options[0];

  return (
    <div className="mt-4 pt-4 border-t border-slate-800">
      <p className="text-blue-400 text-xs font-bold tracking-widest uppercase mb-2">
        Dressing Suggestions
      </p>
      <p className="text-sm text-slate-300 dark:text-slate-200 italic mb-3">
        "{advice}"
      </p>
      {options.length > 1 && (
        <button
          type="button"
          onClick={() => setOptionIndex((prev) => (prev + 1) % options.length)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-blue-400/70 text-[11px] font-semibold text-blue-400 hover:bg-blue-500/10 hover:border-blue-300 transition-colors"
        >
          <span>Show another outfit idea</span>
        </button>
      )}
    </div>
  );
};

export default ClothingAdvice;