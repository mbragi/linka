import express from 'express';
import axios from 'axios';

interface BreadMCPRequest {
  method: string;
  params: Record<string, any>;
  id: string;
}

interface BreadMCPResponse {
  result?: any;
  error?: {
    code: number;
    message: string;
  };
  id: string;
}

class BreadProxy {
  private app: express.Application;
  private breadApiKey: string;
  private breadBaseUrl: string;

  constructor() {
    this.app = express();
    this.breadApiKey = process.env.BREAD_API_KEY!;
    this.breadBaseUrl = process.env.BREAD_BASE_URL || 'https://api.bread.africa';
  }

  initialize() {
    this.app.use(express.json());

    // MCP endpoint
    this.app.post('/mcp', this.handleMCPRequest.bind(this));

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'bread-proxy' });
    });
  }

  private async handleMCPRequest(req: express.Request, res: express.Response) {
    try {
      const mcpRequest: BreadMCPRequest = req.body;
      
      let result: any;
      
      switch (mcpRequest.method) {
        case 'create_account':
          result = await this.createAccount(mcpRequest.params);
          break;
        case 'get_quote':
          result = await this.getQuote(mcpRequest.params);
          break;
        case 'fund_wallet':
          result = await this.fundWallet(mcpRequest.params);
          break;
        case 'withdraw_funds':
          result = await this.withdrawFunds(mcpRequest.params);
          break;
        case 'kyc_verify':
          result = await this.verifyKYC(mcpRequest.params);
          break;
        default:
          throw new Error(`Unknown method: ${mcpRequest.method}`);
      }

      const response: BreadMCPResponse = {
        result,
        id: mcpRequest.id,
      };

      res.json(response);
    } catch (error) {
      const response: BreadMCPResponse = {
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        id: req.body.id || 'unknown',
      };
      res.status(500).json(response);
    }
  }

  private async createAccount(params: Record<string, any>) {
    const response = await axios.post(`${this.breadBaseUrl}/accounts`, {
      email: params.email,
      phone: params.phone,
      name: params.name,
    }, {
      headers: {
        'Authorization': `Bearer ${this.breadApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }

  private async getQuote(params: Record<string, any>) {
    const response = await axios.get(`${this.breadBaseUrl}/quotes`, {
      params: {
        amount: params.amount,
        currency: params.currency,
        type: params.type || 'buy',
      },
      headers: {
        'Authorization': `Bearer ${this.breadApiKey}`,
      },
    });

    return response.data;
  }

  private async fundWallet(params: Record<string, any>) {
    const response = await axios.post(`${this.breadBaseUrl}/transactions`, {
      wallet_address: params.wallet_address,
      amount: params.amount,
      currency: params.currency,
      type: 'fund',
    }, {
      headers: {
        'Authorization': `Bearer ${this.breadApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }

  private async withdrawFunds(params: Record<string, any>) {
    const response = await axios.post(`${this.breadBaseUrl}/transactions`, {
      wallet_address: params.wallet_address,
      amount: params.amount,
      bank_details: params.bank_details,
      type: 'withdraw',
    }, {
      headers: {
        'Authorization': `Bearer ${this.breadApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }

  private async verifyKYC(params: Record<string, any>) {
    const response = await axios.post(`${this.breadBaseUrl}/kyc/verify`, {
      user_id: params.user_id,
      document_type: params.document_type,
      document_data: params.document_data,
    }, {
      headers: {
        'Authorization': `Bearer ${this.breadApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }

  start(port: number = 8080) {
    this.app.listen(port, () => {
      console.log(`Bread Proxy running on port ${port}`);
    });
  }
}

const breadProxy = new BreadProxy();
breadProxy.initialize();
breadProxy.start();
