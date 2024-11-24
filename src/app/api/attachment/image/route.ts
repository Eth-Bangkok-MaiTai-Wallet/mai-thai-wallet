import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { decodeQR } from '@/lib/tools/qrDecoder';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const attachments = messages[0].experimental_attachments;
  const remainingAttachments = [];
  const qrResults = [];

  for (const attachment of attachments) {
    try {
      if (!attachment.contentType?.startsWith('image/')) {
        remainingAttachments.push(attachment);
        continue;
      }
      const qrResult = await decodeQR(attachment.url);
      if (!qrResult) {
        // Keep attachment if QR decode failed/not found
        remainingAttachments.push(attachment);
      } else {
        // Remove attachment if QR decode succeeded
        qrResults.push(qrResult);
      }
    } catch (error) {
      // Keep attachment if decoding errored
      remainingAttachments.push(attachment);
      console.error('QR decode error:', error);
    }
  }

  // Replace with filtered attachments
  messages[0].experimental_attachments = remainingAttachments;

  let aiResult = null;

  if (remainingAttachments.length > 0) {

    messages.unshift({
      role: 'system',
      content: 'Here are the QR codes found in the attachments: ' + JSON.stringify(qrResults)
    });

    aiResult = await generateObject({
      model: openai('gpt-4o-2024-08-06'),
      messages: [
        {
          role: 'system',
          content: 'Analyze the images and extract any Ethereum addresses found. Only include addresses that are valid and present in the images. If no valid Ethereum address is found, return an empty string for that image.'
        },
        ...messages
      ],
      schema: z.object({
        addresses: z.array(
          z.object({
            address: z.string().describe('Ethereum address extracted from the image.').or(z.string().length(0))
          }),
        ),
      }),
    });

    return aiResult.toJsonResponse();

  } else {
    delete messages[0].experimental_attachments;
    messages.push({
      role: 'system', 
      content: 'Here are the QR codes found in the attachments: ' + JSON.stringify(qrResults)
    });

    return messages.toJsonResponse();
  }
}