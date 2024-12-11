import { registry } from '@/lib/providerRegistry';
import { extractJSONFromStream } from '@/lib/utils';
// import { openai } from '@ai-sdk/openai';
import { CoreMessage, streamText } from 'ai';

// type CoreUserMessageWithAttachments = CoreUserMessage & {
//   experimental_attachments?: Array<{
//     type: string;
//     image_url: string;
//   }>;
// };

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const MODEL = registry.languageModel('akash:Meta-Llama-3-1-8B-Instruct-FP8');
const FINAL_PROMPT = 'You receive the user input and the AI agent response with a solution to the inquiry. Formulate the final response to the user based on the answer provided by the agent. Respond with the final answer only.';


export async function POST(req: Request) {
  const { messages: textMessages } = await req.json();

  console.log("----Chat Route----:", JSON.stringify(textMessages));

  // const voiceIntents: any = await retrieveVoiceIntents()
  // const messages = [...textMessages, ...voiceIntents]
  const messages = [...textMessages]

  console.debug('Messages: ', JSON.stringify(messages));

  // Validate and extract messages from request body
  if (!messages || !Array.isArray(messages)) {
    return new Response('Invalid messages format', { status: 400 });
  }

  // Send messages to classification endpoint to determine context and intent
  const classificationResult = await classifyMessages(messages);

  if (!classificationResult) {
    return streamText({
      model: MODEL,
      prompt: 'You were not able to determine the user intent accurately. Respond with a request to clarify.',
    }).toDataStreamResponse();
  }

  console.debug("Classification result: ", JSON.stringify(classificationResult));

  // Extract ethereum addresses from images if present
  // const attachmentResult = await extractAddressFromImage(messages);

  // if (attachmentResult) {
  //   console.debug('Attachment response:', JSON.stringify(attachmentResult));
  //   // Remove attachments from messages
  //   delete (messages[0] as CoreUserMessageWithAttachments).experimental_attachments;
  //   messages.push({
  //     role: 'system',
  //     content: JSON.stringify(attachmentResult)
  //   });
  // }

  // Add classification result to messages after attachment result
  messages.push({
    role: 'system',
    content: JSON.stringify(classificationResult)
  });

  const agentResult = await agentRouter(messages, classificationResult);

  messages.push({
    role: 'assistant',
    content: JSON.stringify(agentResult)
  });
    

  messages.unshift({
    role: 'system',
    content: FINAL_PROMPT
  });

  console.debug('Messages after agent call: ', JSON.stringify(messages));

  const result = streamText({
    model: MODEL,
    messages
  });

  return result.toDataStreamResponse();
}

const callAgent = async (messages: CoreMessage[], route: string) => {
  const agentResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/agent/${route}`, {
    method: 'POST',
    body: JSON.stringify({ messages }),
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.MAITHAI_API_KEY || '',
    }
  });


  if (agentResponse.ok && agentResponse.status !== 204) {
    const agentResult = await agentResponse.json();
    console.log('Agent response:', JSON.stringify(agentResult));

    return agentResult;
  }

  return null;
};

const agentRouter = async (messages: CoreMessage[], classificationResult: string) => {

  // const notImplemented = {answer: 'Not implemented yet.'};
  
  switch (classificationResult) {
    case 'balance_inquiry':
      return callAgent(messages, 'block_explorer');
    case 'eth_transfer_to_address':
      return callAgent(messages, 'transfer');
    case 'eth_transfer_to_ens':
      return callAgent(messages, 'transfer');
    case 'erc20_transfer_to_address':
      return callAgent(messages, 'erc20_transfer');
    case 'erc20_transfer_to_ens':
      return callAgent(messages, 'erc20_transfer');
    case 'erc20_swap':
      return callAgent(messages, 'swap');
    case 'restake':
      return callAgent(messages, 'restake');
    default:
      return {answer: 'I am sorry, I do not understand your request. Please provide clarification.'};
  }
};

const classifyMessages = async (messages: CoreMessage[]): Promise<string | null> => {

  const classifyResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/classification`, {
    method: 'POST',
    body: JSON.stringify({ messages }),
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.MAITHAI_API_KEY || '',
    }
  });

  if (classifyResponse.ok && classifyResponse.status !== 204) {
    const classificationResult: string = await classifyResponse.json();
    return classificationResult;
  }

  return null;
};

const extractAddressFromImage = async (messages: CoreMessage[]): Promise<CoreMessage[] | null> => {
  
  const attachmentResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/attachment/image`, {
    method: 'POST',
    body: JSON.stringify({ messages }),
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.MAITHAI_API_KEY || '',
    }
  });

  if (attachmentResponse.ok) {

    console.debug('Attachment response: ', JSON.stringify(attachmentResponse.json()));

    return attachmentResponse.json();
  }

  return null;
};

const retrieveVoiceIntents = async (): Promise<CoreMessage[] | null> => {
  
  let voiceIntents: any = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/get_transcript`, {
    method: 'GET',
    headers: {
      'x-api-key': process.env.MAITHAI_API_KEY || '',
    }
  })
  
  if (voiceIntents.ok) {
    voiceIntents = await extractJSONFromStream(voiceIntents.body);
    console.debug('Voice intents: ', JSON.stringify(voiceIntents));
    return voiceIntents;
  }
  
  return null;
}