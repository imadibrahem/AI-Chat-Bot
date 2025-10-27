import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import z from 'zod';

dotenv.config();

const client = new OpenAI({
   baseURL: process.env.LM_BASE_URL, // LM Studio local endpoint if you are using oss and LM (comment if you are using online model otherwise add it in .env file)
   apiKey: process.env.OPENAI_API_KEY, // OPENAI API KEY (add in .env file or fill it there with a random string if you are using oss as LM Studio ignores it)
});

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
   res.send('Hello World!');
});

app.get('/api/hello', (req: Request, res: Response) => {
   res.json({ message: 'Hello World!' });
});

const conversations = new Map<string, string>();

const chatSchema = z.object({
   prompt: z
      .string()
      .trim()
      .min(1, 'prompt is required')
      .max(1000, 'prompt is too long (max 1000 characters)'),
   conversationId: z.string().uuid(),
   //conversationId: z.uuid()
});

app.post('/api/chat', async (req: Request, res: Response) => {
   const parseResult = chatSchema.safeParse(req.body);
   if (!parseResult.success) {
      res.status(400).json(parseResult.error.format());
      return;
   }

   try {
      const { prompt, conversationId } = req.body;
      const response = await client.responses.create({
         model: 'gpt-oss-20b', // change to the model that you want to use!
         input: prompt,
         temperature: 0.2,
         max_output_tokens: 200,
         previous_response_id: conversations.get(conversationId),
      });
      conversations.set(conversationId, response.id);

      res.json({ message: response.output_text });
   } catch (error) {
      res.status(500).json({ error: 'Failed to generate a response.' });
   }
});

app.listen(port, () => {
   console.log(`Server is running on http://localhost:${port}`);
});
