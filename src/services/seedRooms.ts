import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const rooms = [
  {
    id: 'A101',
    name: 'Phòng A101',
    location: 'Tòa A - Tầng 1',
    lab: 'Phòng máy',
    capacity: 40,
    status: 'available',
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72',
    description: 'Phòng máy tính phục vụ học tập và thực hành.',
  },
  {
    id: 'A102',
    name: 'Phòng A102',
    location: 'Tòa A - Tầng 1',
    lab: 'Phòng máy',
    capacity: 35,
    status: 'available',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
    description: 'Phòng máy tính dành cho sinh viên.',
  },
  {
    id: 'A201',
    name: 'Phòng A201',
    location: 'Tòa A - Tầng 2',
    lab: 'Phòng học',
    capacity: 60,
    status: 'available',
    image:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
    description: 'Phòng học có sức chứa lớn.',
  },
  {
    id: 'B101',
    name: 'Phòng B101',
    location: 'Tòa B - Tầng 1',
    lab: 'Phòng Lab',
    capacity: 45,
    status: 'maintenance',
    image:
      'https://images.unsplash.com/photo-1531482615713-2afd69097998',
    description: 'Phòng Lab hiện đang bảo trì.',
  },
  {
    id: 'B202',
    name: 'Phòng B202',
    location: 'Tòa B - Tầng 2',
    lab: 'Phòng học',
    capacity: 80,
    status: 'available',
    image:
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2',
    description: 'Phòng học lớn phục vụ các lớp đông sinh viên.',
  },
];

export async function seedRooms() {
  for (const room of rooms) {
    await setDoc(doc(db, 'rooms', room.id), room);
  }

  console.log('Đã tạo dữ liệu phòng thành công!');
}