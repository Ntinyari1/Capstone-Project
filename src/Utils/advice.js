const getClothingAdvice = (temp, condition) => {
  // Now we are reading 'condition'!
  const isRaining = condition?.toLowerCase().includes("rain");

  if (isRaining) {
    return "It's raining! Don't forget an umbrella or a waterproof trench coat.";
  }

  if (temp > 25) {
    return "It's hot! Lightweight cotton, linens, and open shoes are best today.";
  } else if (temp > 18) {
    return "Pleasant weather. A light t-shirt or a stylish blouse will do.";
  } else if (temp > 10) {
    return "Chilly. Time for a denim jacket or layered knits.";
  } else {
    return "Cold alert! Heavy coats and boots are a must.";
  }
};