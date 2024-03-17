// Utility function to generate a random number with 5 decimal points in a given range
const randomNumberInRange = (min, max) => {
    const randomValue = Math.random() * (max - min) + min;
    return parseFloat(randomValue.toFixed(5));
  };
  
  export default { randomNumberInRange };
  