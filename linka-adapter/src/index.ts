import express from 'express';
import { Wit } from 'node-wit';
import axios from 'axios';
import { MongoClient } from 'mongodb';
import Redis from 'ioredis';

interface ChatMessage {
  id: string;
  userId: string;
  channel: string;
  content: string;
  intent?: string;
  timestamp: Date;
}

interface IntentResponse {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
}

class LinkaAdapter {
  private app: express.Application;
  private witClient: Wit;
  private coreServiceUrl: string;
  private mongoClient: MongoClient;
  private redisClient: Redis;

  constructor() {
    this.app = express();
    this.witClient = new Wit({
      accessToken: process.env.WIT_AI_ACCESS_TOKEN!,
    });
    this.coreServiceUrl = process.env.CORE_SERVICE_URL || 'http://localhost:8081';
    this.mongoClient = new MongoClient(process.env.MONGODB_URI!);
    this.redisClient = new Redis(process.env.REDIS_URL!);
  }

  async initialize() {
    this.app.use(express.json());
    
    // WhatsApp webhook endpoint
    this.app.post('/webhook/wasender', this.handleWaSenderWebhook.bind(this));
    
    // Web chat endpoint
    this.app.post('/api/chat', this.handleWebChat.bind(this));
    
    // Farcaster webhook endpoint
    this.app.post('/webhook/farcaster', this.handleFarcasterWebhook.bind(this));

    await this.mongoClient.connect();
    console.log('Connected to MongoDB');
  }

  private async handleWaSenderWebhook(req: express.Request, res: express.Response) {
    try {
      const { phone_number, message, message_id } = req.body;
      
      // Process message through Wit.ai
      const intentResponse = await this.processIntent(message);
      
      // Route to appropriate core service
      const response = await this.routeToCoreService({
        userId: phone_number,
        channel: 'whatsapp',
        content: message,
        intent: intentResponse.intent,
        entities: intentResponse.entities,
      });

      // Send response back via WaSender
      await this.sendWaSenderMessage(phone_number, response.message);

      res.json({ status: 'success' });
    } catch (error) {
      console.error('WaSender webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async handleWebChat(req: express.Request, res: express.Response) {
    try {
      const { userId, message } = req.body;
      
      const intentResponse = await this.processIntent(message);
      
      const response = await this.routeToCoreService({
        userId,
        channel: 'web',
        content: message,
        intent: intentResponse.intent,
        entities: intentResponse.entities,
      });

      res.json(response);
    } catch (error) {
      console.error('Web chat error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async handleFarcasterWebhook(req: express.Request, res: express.Response) {
    try {
      const { data } = req.body;
      const { text, author } = data;
      
      const intentResponse = await this.processIntent(text);
      
      const response = await this.routeToCoreService({
        userId: author.fid.toString(),
        channel: 'farcaster',
        content: text,
        intent: intentResponse.intent,
        entities: intentResponse.entities,
      });

      // Send response back via Farcaster API
      await this.sendFarcasterMessage(author.fid, response.message);

      res.json({ status: 'success' });
    } catch (error) {
      console.error('Farcaster webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async processIntent(message: string): Promise<IntentResponse> {
    try {
      const witResponse = await this.witClient.message(message);
      
      const intent = witResponse.intents?.[0]?.name || 'unknown';
      const confidence = witResponse.intents?.[0]?.confidence || 0;
      
      return {
        intent,
        confidence,
        entities: witResponse.entities || {},
      };
    } catch (error) {
      console.error('Wit.ai processing error:', error);
      return {
        intent: 'unknown',
        confidence: 0,
        entities: {},
      };
    }
  }

  private async routeToCoreService(messageData: any) {
    try {
      const response = await axios.post(`${this.coreServiceUrl}/api/process-message`, messageData);
      return response.data;
    } catch (error) {
      console.error('Core service routing error:', error);
      return {
        message: 'Sorry, I encountered an error processing your request.',
        intent: 'error',
      };
    }
  }

  private async sendWaSenderMessage(phoneNumber: string, message: string) {
    // TODO: Implement WaSender MCP client or REST API call
    console.log(`Sending WhatsApp message to ${phoneNumber}: ${message}`);
  }

  private async sendFarcasterMessage(fid: number, message: string) {
    // TODO: Implement Farcaster API call
    console.log(`Sending Farcaster message to ${fid}: ${message}`);
  }

  start(port: number = 3001) {
    this.app.listen(port, () => {
      console.log(`Linka Adapter running on port ${port}`);
    });
  }
}

const adapter = new LinkaAdapter();
adapter.initialize().then(() => {
  adapter.start();
}).catch(console.error);

export default LinkaAdapter;
