import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { extractJSONFromStream } from '@/lib/tools/utils';
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  let { messages } = await req.json();

  let voiceIntents: any = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/transcript`, {
    method: 'GET'
  })
  voiceIntents = await extractJSONFromStream(voiceIntents.body)
  
  messages = [...messages, ...voiceIntents]

  console.log("---> Messages: ", messages)


  const classifyResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/classify`, {
    method: 'POST',
    body: JSON.stringify({ messages }),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  console.log("Classify response: ", classifyResponse)

  if (messages[0].experimental_attachments) {
    const attachmentResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/attachment/image`, {
      method: 'POST',
      body: JSON.stringify({ messages }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (attachmentResponse.ok) {
      const attachmentResult = await attachmentResponse.json();
      console.log('Attachment response:', JSON.stringify(attachmentResult));

      // Remove experimental_attachments and add system message with result
      // delete messages[0].experimental_attachments;
      messages.push({
        role: 'system',
        content: JSON.stringify(attachmentResult)
      });
    }
  }

  console.log('After attachment:', JSON.stringify(messages));

  if (classifyResponse.ok && classifyResponse.status !== 204) {
    const classification = await classifyResponse.json();
    console.log("Classification result: ", JSON.stringify(classification));
    
    messages.push({
      role: 'system',
      content: `Context: ${classification}`
    });

    const agentResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/agent`, {
      method: 'POST',
      body: JSON.stringify({ messages }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (agentResponse.ok && agentResponse.status !== 204) {
      const agentResult = await agentResponse.json();
      console.log('Agent response:', JSON.stringify(agentResult));

      messages.push({
        role: 'assistant',
        content: JSON.stringify(agentResult)
      });
      
    }

    //This agent call stores blockchain transaction object in the key store database
    const objectResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/transaction`, {
      method: 'POST',
      body: JSON.stringify({ messages }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log("----Object response----: ", await objectResponse.json());
  }

  console.log("Messages after classification: ", messages)

  const prompt = 'You are a talking ethereum smart wallet. You receive the user input and the AI agent response with a solution to the inquiry. Formulate the final response to the user.';

  messages.unshift({
    role: 'system',
    content: prompt
  });

  console.log(JSON.stringify(messages));

  // let schema = ''
  // if ( transactionType == 'eth_transfer_to_ens' || 'eth_transfer_to_address'){
  //   schema = z.object({
  //     to: z.string().describe("receiver address"),
  //     value: z.string().describe("amount to transfer")
  //   })
  // } else if (transactionType == 'erc20_transfer_to_ens' || transactionType == 'erc20_transfer_to_address'){
  //     to: z.string().describe("address of the contract to interact with"),
  //     data: z.string().describe("data should be empty string"),
  //     value: z.string().describe("amount to transfer")
  // }


  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages
  });

  // const result = streamText({
  //   model: openai('gpt-4-turbo'),
  //   messages,
  //   prompt: 'You are a talking ethereum smart wallet. Your eceive the user input and the AI agent response with a solution to the inquiry. Formuate the final response to the user.'
  // });

  return result.toDataStreamResponse();
}