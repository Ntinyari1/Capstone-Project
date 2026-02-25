import React from 'react';

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

  let advice = "";

  if (isStormy) {
    advice =
      "Stormy skies ahead. Bold Spot recommends waterproof outerwear, non-slip shoes, and avoiding loose accessories.";
  } else if (isSnowing) {
    advice =
      "Snowy conditions. Layer thermal pieces, insulated coats, and weatherproof boots from Bold Spot.";
  } else if (isRaining) {
    advice =
      "It's raining. Grab an umbrella, a waterproof jacket, and closed shoes that can handle puddles.";
  } else if (isFoggy) {
    advice =
      "Low visibility and damp air. Choose warm layers in high-visibility tones so you stay both safe and stylish.";
  } else if (typeof windSpeed === "number" && windSpeed > 8) {
    advice =
      "Windy outside. Go for fitted outer layers, secure hats, and avoid flowy pieces that might whip around.";
  } else if (celsiusTemp == null) {
    advice =
      "Bold Spot suggests flexible layering today—conditions are changing, so keep a light jacket within reach.";
  } else if (celsiusTemp > 28) {
    advice =
      "Heat alert. Light cotton, breathable sneakers, and UV-protective accessories keep you cool and polished.";
  } else if (celsiusTemp > 20) {
    advice =
      "Warm and comfortable. A crisp tee or blouse with relaxed trousers is a perfect Bold Spot combo.";
  } else if (celsiusTemp > 12) {
    advice =
      "Mildly chilly. Layer a denim or bomber jacket over your outfit for an effortless street-ready look.";
  } else {
    advice =
      "Cold alert. Reach for heavy coats, knitwear, and insulated footwear to stay warm without losing your edge.";
  }

  return (
    <div className="mt-4 pt-4 border-t border-slate-800">
      <p className="text-blue-400 text-xs font-bold tracking-widest uppercase mb-2">
        Bold Spot Style Consultant
      </p>
      <p className="text-sm text-slate-300 italic">
        "{advice}"
      </p>
    </div>
  );
};

export default ClothingAdvice;