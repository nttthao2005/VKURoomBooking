export type Room = {
  id: string;
  name: string;
  location: string;
  lab: string;
  capacity: number;
  status: 'available' | 'maintenance';
  image: string;
  description: string;
};