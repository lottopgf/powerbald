export const POWERBALD_ABI = [
  {
    type: 'constructor',
    name: '__init__',
    inputs: [
      {
        name: 'randomiser',
        type: 'address',
      },
      {
        name: 'ball_domain',
        type: 'uint8',
      },
      {
        name: 'game_duration',
        type: 'uint256',
      },
      {
        name: 'entry_price',
        type: 'uint256',
      },
      {
        name: 'fee_recipient',
        type: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'randomiser',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'games_count',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'game_seed',
    inputs: [
      {
        name: 'game_num',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'entries_count',
    inputs: [
      {
        name: 'game_num',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'entries',
    inputs: [
      {
        name: 'game_num',
        type: 'uint256',
      },
      {
        name: 'entry_num',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          {
            name: 'participant',
            type: 'address',
          },
          {
            name: 'picks',
            type: 'bytes',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'game_duration',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'game_finalised',
    inputs: [
      {
        name: 'game_num',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'entry_price',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'jackpot',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'fee_recipient',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'enter',
    inputs: [
      {
        name: 'picks',
        type: 'bytes',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'compute_winning_balls',
    inputs: [
      {
        name: 'game_num',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'claim',
    inputs: [
      {
        name: 'game_num',
        type: 'uint256',
      },
      {
        name: 'entry_num',
        type: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'draw',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'receiveRandomWord',
    inputs: [
      {
        name: 'request_id',
        type: 'uint256',
      },
      {
        name: 'random_word',
        type: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    name: 'Entry',
    inputs: [
      {
        name: 'participant',
        type: 'address',
        indexed: false,
      },
      {
        name: 'picks',
        type: 'bytes',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PickOutOfRange',
    inputs: [
      {
        name: 'x',
        type: 'uint8',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'UnknownRandomiser',
    inputs: [
      {
        name: 'randomiser',
        type: 'address',
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'WaitLonger',
    inputs: [],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RawCallBuffer',
    inputs: [
      {
        name: 'input_len',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'output_len',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'buf',
        type: 'tuple',
        components: [
          {
            name: 'offset',
            type: 'uint256',
          },
          {
            name: 'len',
            type: 'uint256',
          },
        ],
        indexed: false,
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Context',
    inputs: [],
    anonymous: false,
  },
] as const
