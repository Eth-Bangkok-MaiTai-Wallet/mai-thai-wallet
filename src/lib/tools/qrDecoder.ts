import jsQR from 'jsqr';
import { loadImage } from 'canvas';

export async function decodeQR(base64Image: string): Promise<string | null> {

  return null;
  try {
    console.log('Input base64Image:', base64Image.substring(0, 50) + '...');
    console.log('Input base64Image length:', base64Image.length);
    
    // Log base64Data after prefix removal
    const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    console.log('Cleaned base64Data:', base64Data.substring(0, 50) + '...');
    console.log('Cleaned base64Data length:', base64Data.length);
    
    // Log buffer details
    const imageBuffer = Buffer.from(base64Data, 'base64');
    console.log('imageBuffer size:', imageBuffer.length, 'bytes');
    
    // Log Uint8ClampedArray details
    const imageData = new Uint8ClampedArray(imageBuffer);
    console.log('imageData array length:', imageData.length);
    console.log('imageData first 10 values:', Array.from(imageData.slice(0, 10)));
    // Remove data URL prefix if present
    // const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    // // Create buffer from base64
    // const imageBuffer = Buffer.from(base64Data, 'base64');

    // // Create Uint8ClampedArray from buffer
    // const imageData = new Uint8ClampedArray(imageBuffer);

     // Create ImageData object from Uint8ClampedArray
     const imageDimensions = await getImageDimensions(base64Image);

    console.log('imageDimensions:', imageDimensions.width, imageDimensions.height);
 

    try {
      // Decode QR code using jsQR
      const result = jsQR(imageData, imageDimensions.width, imageDimensions.height);

      // Return decoded text or null if no QR code found
      return result ? result.data : null;
    } catch (error) {
      console.error('QR decode error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in decodeQR:', error);
    throw new Error(`Failed to decode QR code: ${error}`);
  }
}

async function getImageDimensions(base64Image: string): Promise<{ width: number; height: number }> {
  const image = await loadImage(base64Image);
  console.log('image:', image.src.length);
  return { width: image.width, height: image.height };
}