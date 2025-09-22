import { ethers, Contract, BrowserProvider, JsonRpcSigner } from 'ethers';

// Contract ABI - only include the functions we need
export const PREDICTION_REGISTRY_ABI = [
  // // Events
  // 'event PredictionRecorded(bytes32 indexed predictionHash, bytes32 inputHash, string modelVersion, string ipfsCid, address indexed reporter, uint256 timestamp, uint256 blockNumber)',
  
  // // Read functions
  // 'function getPrediction(bytes32 predictionHash) view returns (bytes32 predictionHashOut, bytes32 inputHashOut, string modelVersionOut, string ipfsCidOut, address reporterOut, uint256 timestampOut, uint256 blockNumberOut)',
  // 'function isRecorded(bytes32 predictionHash) view returns (bool)',
  // 'function hasRole(bytes32 role, address account) view returns (bool)',
  
  // // Write functions
  // 'function recordPrediction(bytes32 predictionHash, bytes32 inputHash, string modelVersion, string ipfsCid)',
  // 'function grantReporter(address account)',
  // 'function revokeReporter(address account)',
  
  // // Constants
  // 'function REPORTER_ROLE() view returns (bytes32)',
  // 'function DEFAULT_ADMIN_ROLE() view returns (bytes32)',

  [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "initialReporter",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "AccessControlBadConfirmation",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "neededRole",
				"type": "bytes32"
			}
		],
		"name": "AccessControlUnauthorizedAccount",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "grantReporter",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "grantRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "predictionHash",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "inputHash",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "modelVersion",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "ipfsCid",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "reporter",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "blockNumber",
				"type": "uint256"
			}
		],
		"name": "PredictionRecorded",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "predictionHash",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "inputHash",
				"type": "bytes32"
			},
			{
				"internalType": "string",
				"name": "modelVersion",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "ipfsCid",
				"type": "string"
			}
		],
		"name": "recordPrediction",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "callerConfirmation",
				"type": "address"
			}
		],
		"name": "renounceRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "revokeReporter",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "revokeRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "previousAdminRole",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "newAdminRole",
				"type": "bytes32"
			}
		],
		"name": "RoleAdminChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "RoleGranted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "RoleRevoked",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "DEFAULT_ADMIN_ROLE",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "predictionHash",
				"type": "bytes32"
			}
		],
		"name": "getPrediction",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "predictionHashOut",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "inputHashOut",
				"type": "bytes32"
			},
			{
				"internalType": "string",
				"name": "modelVersionOut",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "ipfsCidOut",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "reporterOut",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "timestampOut",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "blockNumberOut",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			}
		],
		"name": "getRoleAdmin",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "hasRole",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "predictionHash",
				"type": "bytes32"
			}
		],
		"name": "isRecorded",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "REPORTER_ROLE",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
];

// Replace with your deployed contract address
export const CONTRACT_ADDRESS = '0x550C0d0063c6d3fA6de9F1055Db5917800892F10'; // TODO: Update with actual deployment

export interface PredictionData {
  predictionHash: string;
  inputHash: string;
  modelVersion: string;
  ipfsCid: string;
  reporter: string;
  timestamp: number;
  blockNumber: number;
}

export interface PredictionEvent {
  predictionHash: string;
  inputHash: string;
  modelVersion: string;
  ipfsCid: string;
  reporter: string;
  timestamp: number;
  blockNumber: number;
  transactionHash: string;
}

export class PredictionRegistryContract {
  private contract: Contract;
  private provider: BrowserProvider;
  private signer?: JsonRpcSigner;

  constructor(provider: BrowserProvider, signer?: JsonRpcSigner) {
    this.provider = provider;
    this.signer = signer;
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      PREDICTION_REGISTRY_ABI,
      signer || provider
    );
  }

  // Read functions
  async getPrediction(predictionHash: string): Promise<PredictionData | null> {
    try {
      const result = await this.contract.getPrediction(predictionHash);
      
      // Check if prediction exists (predictionHashOut should not be zero)
      if (result.predictionHashOut === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        return null;
      }

      return {
        predictionHash: result.predictionHashOut,
        inputHash: result.inputHashOut,
        modelVersion: result.modelVersionOut,
        ipfsCid: result.ipfsCidOut,
        reporter: result.reporterOut,
        timestamp: Number(result.timestampOut),
        blockNumber: Number(result.blockNumberOut),
      };
    } catch (error) {
      console.error('Error getting prediction:', error);
      throw error;
    }
  }

  async isRecorded(predictionHash: string): Promise<boolean> {
    try {
      return await this.contract.isRecorded(predictionHash);
    } catch (error) {
      console.error('Error checking if recorded:', error);
      throw error;
    }
  }

  async hasReporterRole(address: string): Promise<boolean> {
    try {
      const reporterRole = await this.contract.REPORTER_ROLE();
      return await this.contract.hasRole(reporterRole, address);
    } catch (error) {
      console.error('Error checking reporter role:', error);
      throw error;
    }
  }

  // Write functions (require signer)
  async recordPrediction(
    predictionHash: string,
    inputHash: string,
    modelVersion: string,
    ipfsCid: string = ''
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer required for write operations');
    }

    try {
      // Estimate gas first
      const estimatedGas = await this.contract.recordPrediction.estimateGas(
        predictionHash,
        inputHash,
        modelVersion,
        ipfsCid
      );

      // Add 20% buffer to gas estimate
      const gasLimit = (estimatedGas * BigInt(120)) / BigInt(100);

      const tx = await this.contract.recordPrediction(
        predictionHash,
        inputHash,
        modelVersion,
        ipfsCid,
        { gasLimit }
      );

      return tx;
    } catch (error) {
      console.error('Error recording prediction:', error);
      throw error;
    }
  }

  // Event queries
  async getPredictionEvents(
    fromBlock: number = 0,
    toBlock: number | string = 'latest',
    modelVersion?: string
  ): Promise<PredictionEvent[]> {
    try {
      const filter = this.contract.filters.PredictionRecorded();
      const events = await this.contract.queryFilter(filter, fromBlock, toBlock);

      const predictionEvents: PredictionEvent[] = events.map((event: any) => ({
        predictionHash: event.args.predictionHash,
        inputHash: event.args.inputHash,
        modelVersion: event.args.modelVersion,
        ipfsCid: event.args.ipfsCid,
        reporter: event.args.reporter,
        timestamp: Number(event.args.timestamp),
        blockNumber: Number(event.args.blockNumber),
        transactionHash: event.transactionHash,
      }));

      // Filter by model version if specified
      if (modelVersion) {
        return predictionEvents.filter(event => event.modelVersion === modelVersion);
      }

      return predictionEvents.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error fetching prediction events:', error);
      throw error;
    }
  }

  // Utility functions
  static hashString(input: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(input));
  }

  static formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  static getExplorerUrl(hash: string, type: 'tx' | 'address' = 'tx'): string {
    const baseUrl = 'https://sepolia.etherscan.io';
    return type === 'tx' ? `${baseUrl}/tx/${hash}` : `${baseUrl}/address/${hash}`;
  }

  static get contractAddress(): string {
    return CONTRACT_ADDRESS;
  }
}

export default PredictionRegistryContract;
