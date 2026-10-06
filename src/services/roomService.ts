import {
  collection,
  getDocs,
} from 'firebase/firestore';

import { db } from './firebase';
import { Room } from '../types/room';
import type { RoomSlot } from '../types/roomSlot';

export async function getRooms(): Promise<Room[]> {
  const snapshot = await getDocs(
    collection(db, 'rooms')
  );

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as Room[];
}

export async function getRoomSlots(): Promise<RoomSlot[]> {
  const snapshot = await getDocs(
    collection(db, 'roomSlots')
  );

  return snapshot.docs.map((document) => {
    const data = document.data();

    return {
      roomId: data.roomId,
      date: data.date,
      slot: data.slot,
    };
  });
}