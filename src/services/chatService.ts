// src/services/chatService.ts
import type { ChatMessage } from '@/lib/types';

const CUSTOM_BACKEND_URL = process.env['NEXT_PUBLIC_CUSTOM_BACKEND_URL'] || 'http://localhost:5000';

interface SendMessagePayload {
  matchId: string;
  senderId: string;
  receiverId: string;
  text: string;
}

export async function sendMessage(payload: SendMessagePayload): Promise<ChatMessage> {
  try {
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/matches/${payload.matchId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: `Failed to send message. Status: ${response.status}` }));
      throw new Error(errorData.message);
    }
    const newMessage = await response.json();
    return { ...newMessage, id: newMessage._id.toString() }; // Ensure frontend id is mapped
  } catch (error) {
    console.error('Error in sendMessage service:', error);
    throw error;
  }
}

export async function fetchMessages(matchId: string): Promise<ChatMessage[]> {
  try {
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/matches/${matchId}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Ensure fresh messages are fetched
    });
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: `Failed to fetch messages. Status: ${response.status}` }));
      throw new Error(errorData.message);
    }
    const messages = await response.json();
    return messages.map((msg: any) => ({ ...msg, id: msg._id.toString() })); // Ensure frontend id is mapped
  } catch (error) {
    console.error('Error in fetchMessages service:', error);
    throw error;
  }
}
