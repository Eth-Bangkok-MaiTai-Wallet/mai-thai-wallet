export const eigenLayerStrategyManagerAbi = [
    {
      name: 'depositIntoStrategy',
      type: 'function',
      inputs: [
        {
          name: 'strategy',
          type: 'address',
        },
        {
          name: 'underlyingToken',  
          type: 'address',
        },
        {
          name: 'amount',
          type: 'uint256',
        },
      ],
      outputs: [
        {
          name: '',
          type: 'uint256',
        },
      ],
    },
    {
      name: 'paused',
      type: 'function',
      inputs: [],
      outputs: [
        {
          name: '',
          type: 'bool',
        },
      ],
    },
    {
      name: 'stakerStrategyListLength',
      type: 'function',
      inputs: [
        {
          name: 'staker',
          type: 'address',
        },
      ],
      outputs: [
        {
          name: '',
          type: 'uint256',
        },
      ],
    },
    {
      name: 'stakerStrategyShares',
      type: 'function',
      inputs: [
        {
          name: 'staker',
          type: 'address',
        },
        {
          name: 'strategy',
          type: 'address',
        },
      ],
      outputs: [
        {
          name: '',
          type: 'uint256',
        },
      ],
    },
  ];