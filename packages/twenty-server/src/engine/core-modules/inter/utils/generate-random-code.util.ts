/* @kvoip-woulz proprietary */
export const generateRandomCode = () =>
  (Math.random() + 1).toString(36).substring(2);
