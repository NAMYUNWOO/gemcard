import { useState, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import type { GemCard, GemParams } from '../types/card';

const STORAGE_KEY = 'gemcard:cards';

function loadCards(): GemCard[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCards(cards: GemCard[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch (e) {
    console.warn('Failed to save cards:', e);
  }
}

export function useCardStore() {
  const [cards, setCards] = useState<GemCard[]>(() => loadCards());

  useEffect(() => {
    saveCards(cards);
  }, [cards]);

  const createCard = useCallback((
    gem: Omit<GemParams, 'id'>,
    content: string,
    senderName?: string
  ): GemCard => {
    const newCard: GemCard = {
      id: nanoid(10),
      gem,
      message: {
        content,
        senderName,
        createdAt: Date.now(),
      },
    };
    setCards(prev => [newCard, ...prev]);
    return newCard;
  }, []);

  const addCard = useCallback((card: GemCard) => {
    setCards(prev => {
      if (prev.some(c => c.id === card.id)) {
        return prev;
      }
      return [card, ...prev];
    });
  }, []);

  const deleteCard = useCallback((id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  }, []);

  const getCard = useCallback((id: string): GemCard | undefined => {
    return cards.find(c => c.id === id);
  }, [cards]);

  return {
    cards,
    createCard,
    addCard,
    deleteCard,
    getCard,
  };
}
