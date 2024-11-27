import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  console.debug('Messages: ', JSON.stringify(messages));

  const attachments = messages[0].experimental_attachments;

  console.debug('Attachments: ', JSON.stringify(attachments));

  if (attachments.length > 0) {

    const result = await generateObject({
      model: openai('gpt-4o-2024-08-06'),
      messages: [
        {
          role: 'system',
          content: 'Analyze the images and extract any Ethereum addresses found. Only include addresses that are valid and present in the images. If no valid Ethereum address is found, return an empty string for that image.Also provide a context for the image.'
        },
        ...messages
      ],
      schema: z.object({
        addresses: z.array(
          z.object({
            address: z.string().describe('Ethereum address extracted from the image.').or(z.string().length(0)),
            context: z.string().describe('Context of the image. E.g. receiver, sender, balance lookup, etc. OR - no valid address found.')
          }),
        ),
      }),
    });

    console.debug('Result: ', JSON.stringify(result));

    return result.toJsonResponse();

  } else {
    delete messages[0].experimental_attachments;
    messages.push({
      role: 'system', 
      content: 'No images found.'
    });

    return messages.toJsonResponse();
  }
}