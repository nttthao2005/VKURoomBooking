import { create } from 'zustand';

type CapacityFilter =
  | 'all'
  | 'small'
  | 'medium'
  | 'large';

type StatusFilter =
  | 'all'
  | 'available'
  | 'maintenance';

type BookingStore = {
  selectedDate: Date;
  startTime: Date;
  endTime: Date;

  capacityFilter: CapacityFilter;
  statusFilter: StatusFilter;

  setSelectedDate: (date: Date) => void;
  setStartTime: (time: Date) => void;
  setEndTime: (time: Date) => void;

  setCapacityFilter: (
    filter: CapacityFilter
  ) => void;

  setStatusFilter: (
    filter: StatusFilter
  ) => void;
};

const createTime = (
  hour: number,
  minute: number
) => {
  const date = new Date();

  date.setHours(hour);
  date.setMinutes(minute);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date;
};

export const useBookingStore =
  create<BookingStore>((set) => ({
    selectedDate: new Date(),

    startTime: createTime(8, 0),

    endTime: createTime(9, 0),

    capacityFilter: 'all',

    statusFilter: 'all',

    setSelectedDate: (date) => {
      set({
        selectedDate: date,
      });
    },

    setStartTime: (time) => {
      set({
        startTime: time,
      });
    },

    setEndTime: (time) => {
      set({
        endTime: time,
      });
    },

    setCapacityFilter: (filter) => {
      set({
        capacityFilter: filter,
      });
    },

    setStatusFilter: (filter) => {
      set({
        statusFilter: filter,
      });
    },
  }));