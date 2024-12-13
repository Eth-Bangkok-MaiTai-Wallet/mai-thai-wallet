import { litAction } from "@/lit/litAction";

export async function executeLitAction(number1: string, number2: string): Promise<string> {
  console.log('Running executeLitAction tool with numbers:', number1, number2);
  
  try {
    //here should lit action logic go
    const litResponse = await litAction(number1, number2);
    console.log("Lit Response: ", litResponse)
    return litResponse.response.toString();

  } catch (error) {
    console.error('Error fetching ETH balance:', error);
    throw error;
  }
}
