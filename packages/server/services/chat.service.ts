import OpenAI from 'openai';
import { conversationRepsitory } from '../repositories/conversation.repository';

const client = new OpenAI({
   baseURL: process.env.LM_BASE_URL, // LM Studio local endpoint if you are using oss and LM (comment if you are using online model otherwise add it in .env file)
   apiKey: process.env.OPENAI_API_KEY, // OPENAI API KEY (add in .env file or fill it there with a random string if you are using oss as LM Studio ignores it)
});

type ChatResponse = {
   id: string;
   message: string;
};

export const chatService = {
   async sendMessage(
      prompt: string,
      conversationId: string
   ): Promise<ChatResponse> {
      const response = await client.responses.create({
         model: 'gpt-oss-20b', // change to the model that you want to use!
         input: prompt,
         temperature: 0.2,
         max_output_tokens: 200,
         previous_response_id:
            conversationRepsitory.getLastResponseId(conversationId),
      });
      conversationRepsitory.setLastResponseId(conversationId, response.id);

      return {
         id: response.id,
         message: response.output_text,
      };
   },
};
