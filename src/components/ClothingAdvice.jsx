import React from 'react';

const ClothingAdvice = ({ temp, condition, unit }) => {
  const isRaining = condition?.toLowerCase().includes("rain");
  
  // Convert logic to handle both Celsius and Fahrenheit for the advice
  const celsiusTemp = unit === 'metric' ? temp : (temp - 32) * 5/9;

  let advice = "";
  if (isRaining) {
    advice = "It's raining! Grab an umbrella and a waterproof jacket.";
  } else if (celsiusTemp > 25) {
    advice = "It's hot! Wear light cotton and breathable shoes.";
  } else if (celsiusTemp > 18) {
    advice = "Pleasant weather. A light t-shirt or a blouse is perfect.";
  } else if (celsiusTemp > 10) {
    advice = "Chilly. Time for a denim jacket or layered knits.";
  } else {
    advice = "Cold alert! Heavy coats and boots are a must.";
  }

  return (
    <div className="mt-4 pt-4 border-t border-slate-800">
      <p className="text-blue-400 text-xs font-bold tracking-widest uppercase mb-2">Style Tip</p>
      <p className="text-sm text-slate-300 italic">
        "{advice}"
      </p>
    </div>
  );
};

export default ClothingAdvice;