export const loadImage = (src: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.crossOrigin = "Anonymous";

    img.src = src;

    img.onload = () => {
      resolve(img);
    };

    img.onerror = (e) => {
      reject(e);
    };
  });
};
