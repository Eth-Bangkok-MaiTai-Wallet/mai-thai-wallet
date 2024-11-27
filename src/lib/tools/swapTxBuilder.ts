
interface SwapResponse {
  to: string;
  gasLimit: string;
  data: string;
  value: string;
}

export async function getSwapTransaction(amount: string, fromToken: string, toToken: string, address: string): Promise<SwapResponse[]> {
  try {
    const prompt = `I want to swap ${amount} ${fromToken} for ${toToken} on base`;

    console.log("----Swap Tx Builder----:", prompt);
    console.log("----Swap Tx Builder----:", address);
    
    const response = await fetch("https://api.brianknows.org/api/v0/agent/transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-brian-api-key": process.env.BRIAN_API_KEY || ""
      },
      body: JSON.stringify({
        prompt,
        address: "0x0000000000000000000000000000000000000000",
      })
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    const swapData = data.result[0].data;

    const transactions: SwapResponse[] = swapData.steps.map((step: any) => ({
      to: step.to,
      gasLimit: step.gasLimit,
      data: step.data,
      value: step.value,

    }));

    console.log("----Swap Tx Builder----:", transactions);

    return transactions;

  } catch (error) {
    console.error("Error fetching swap transaction:", error);
    throw error;
  }
}
