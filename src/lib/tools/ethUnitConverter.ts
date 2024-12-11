interface EthBalance {
  value: string;
}

export async function convertToWei(amount: string, unit: string): Promise<EthBalance> {
  let valueInWei: string;

  switch (unit.toLowerCase()) {
    case 'wei':
      valueInWei = amount;
      break;
    case 'kwei':
    case 'babbage':
      valueInWei = (BigInt(amount) * BigInt(Math.pow(10, 3))).toString();
      break;
    case 'mwei':
    case 'lovelace':
      valueInWei = (BigInt(amount) * BigInt(Math.pow(10, 6))).toString();
      break;
    case 'gwei':
    case 'shannon':
      valueInWei = (BigInt(amount) * BigInt(Math.pow(10, 9))).toString();
      break;
    case 'szabo':
    case 'microether':
    case 'micro':
      valueInWei = (BigInt(amount) * BigInt(Math.pow(10, 12))).toString();
      break;
    case 'finney':
    case 'milliether':
    case 'milli':
      valueInWei = (BigInt(amount) * BigInt(Math.pow(10, 15))).toString();
      break;
    case 'ether':
    case 'eth':
      valueInWei = (BigInt(amount) * BigInt(Math.pow(10, 18))).toString();
      break;
    default:
      throw new Error(`Unsupported Ether unit: ${unit}`);
  }

  return { value: valueInWei };
}
