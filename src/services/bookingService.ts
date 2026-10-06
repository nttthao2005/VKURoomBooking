import {
  collection,
  doc,
  runTransaction,
  Timestamp,
} from 'firebase/firestore';

import { db } from './firebase';

export type CreateBookingParams = {
  roomId: string;
  roomName: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
};

/**
 * Chuyển "08:00" thành số phút tính từ 00:00
 */
function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);

  return hours * 60 + minutes;
}

/**
 * Tạo danh sách slot theo GIỜ TRÒN.
 *
 * Ví dụ:
 *
 * 08:00 -> 10:00
 *
 * sẽ tạo:
 *
 * 08:00
 * 09:00
 *
 * Không tạo:
 * 08:30
 * 09:30
 */
function createSlots(startTime: string, endTime: string) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  const slots: string[] = [];

  for (
    let current = start;
    current < end;
    current += 60
  ) {
    const hours = Math.floor(current / 60);

    const slot =
      `${String(hours).padStart(2, '0')}:00`;

    slots.push(slot);
  }

  return slots;
}
function getBookingSlotRefs(
  roomId: string,
  date: string,
  slots: string[]
) {
  return slots.map((slot) =>
    doc(
      db,
      'roomSlots',
      `${roomId}_${date}_${slot.replace(':', '')}`
    )
  );
}
export async function createBooking({
  roomId,
  roomName,
  userId,
  date,
  startTime,
  endTime,
}: CreateBookingParams) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  /*
   * 1. Kiểm tra giờ kết thúc
   */
  if (end <= start) {
    throw new Error(
      'Giờ kết thúc phải sau giờ bắt đầu.'
    );
  }

  /*
   * 2. Chỉ cho phép GIỜ TRÒN
   *
   * Hợp lệ:
   * 08:00
   * 09:00
   * 10:00
   *
   * Không hợp lệ:
   * 08:30
   * 09:30
   */
  if (
    start % 60 !== 0 ||
    end % 60 !== 0
  ) {
    throw new Error(
      'Thời gian đặt phòng phải là giờ tròn, ví dụ 08:00, 09:00, 10:00.'
    );
  }

  /*
   * 3. Tạo danh sách slot
   *
   * Ví dụ:
   *
   * 08:00 -> 10:00
   *
   * => ['08:00', '09:00']
   */
  const slots = createSlots(
    startTime,
    endTime
  );

  if (slots.length === 0) {
    throw new Error(
      'Khoảng thời gian đặt phòng không hợp lệ.'
    );
  }

  /*
   * 4. Transaction
   *
   * Kiểm tra tất cả slot trước khi tạo booking.
   *
   * Điều này giúp chống trường hợp:
   *
   * User A đặt A101 08:00 - 10:00
   *
   * User B cũng đặt A101 08:00 - 10:00
   *
   * Hai người không thể cùng chiếm một slot.
   */
  const result = await runTransaction(
    db,
    async (transaction) => {
      /*
       * Tạo reference cho từng slot
       *
       * Ví dụ:
       *
       * A101_2026-10-01_0800
       * A101_2026-10-01_0900
       */
      const slotRefs = getBookingSlotRefs(
  roomId,
  date,
  slots
);

      /*
       * Đọc tất cả slot trong transaction.
       */
      const slotSnapshots = [];

      for (const slotRef of slotRefs) {
        const snapshot =
          await transaction.get(slotRef);

        slotSnapshots.push(snapshot);
      }

      /*
       * Nếu có bất kỳ slot nào đã tồn tại
       * thì phòng đã được đặt.
       */
      const occupiedSlot =
        slotSnapshots.find(
          (snapshot) => snapshot.exists()
        );

      if (occupiedSlot) {
        throw new Error(
          'Phòng đã được đặt trong khoảng thời gian này.'
        );
      }

      /*
       * 5. Tạo booking chính
       */
      const bookingRef = doc(
        collection(db, 'bookings')
      );

      transaction.set(bookingRef, {
        roomId,
        roomName,
        userId,
        date,
        startTime,
        endTime,
        status: 'confirmed',
        createdAt: Timestamp.now(),
      });

      /*
       * 6. Tạo các roomSlots
       *
       * Ví dụ:
       *
       * Đặt A101:
       * 08:00 -> 10:00
       *
       * sẽ tạo:
       *
       * A101_2026-10-01_0800
       * A101_2026-10-01_0900
       */
      slotRefs.forEach(
        (slotRef, index) => {
          transaction.set(slotRef, {
            roomId,
            date,
            slot: slots[index],
            bookingId: bookingRef.id,
            userId,
            roomName,
            createdAt: Timestamp.now(),
          });
        }
      );

      return bookingRef.id;
    }
  );

  return result;
}
type CancelBookingParams = {
  bookingId: string;
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  userId: string;
};

/**
 * Hủy một booking.
 *
 * Đồng thời:
 * 1. Đổi status của booking thành "cancelled"
 * 2. Xóa toàn bộ roomSlots tương ứng
 *
 * Hai thao tác được thực hiện trong cùng một transaction.
 */
export async function cancelBooking({
  bookingId,
  roomId,
  date,
  startTime,
  endTime,
  userId,
}: CancelBookingParams) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  if (end <= start) {
    throw new Error(
      'Khoảng thời gian đặt phòng không hợp lệ.'
    );
  }

  const slots = createSlots(
    startTime,
    endTime
  );

  if (slots.length === 0) {
    throw new Error(
      'Không tìm thấy slot của booking.'
    );
  }

  await runTransaction(
    db,
    async (transaction) => {
      /*
       * Reference của booking
       */
      const bookingRef = doc(
        db,
        'bookings',
        bookingId
      );

      /*
       * Đọc booking trước.
       */
      const bookingSnapshot =
        await transaction.get(bookingRef);

      if (!bookingSnapshot.exists()) {
        throw new Error(
          'Không tìm thấy lịch đặt phòng.'
        );
      }

      const bookingData =
        bookingSnapshot.data();

      /*
       * Kiểm tra booking có đúng user hiện tại không.
       */
      if (bookingData.userId !== userId) {
        throw new Error(
          'Bạn không có quyền hủy lịch đặt phòng này.'
        );
      }

      /*
       * Nếu booking đã hủy thì không làm lại.
       */
      if (bookingData.status === 'cancelled') {
        throw new Error(
          'Lịch đặt phòng này đã được hủy.'
        );
      }

      /*
       * Tạo reference cho tất cả roomSlots.
       *
       * Ví dụ:
       *
       * A101_2026-10-01_0800
       * A101_2026-10-01_0900
       */
      const slotRefs = getBookingSlotRefs(
  roomId,
  date,
  slots
);

      /*
       * Phải đọc tất cả slot trước khi bắt đầu ghi/xóa.
       */
      const slotSnapshots = [];

      for (const slotRef of slotRefs) {
        const snapshot =
          await transaction.get(slotRef);

        slotSnapshots.push({
          ref: slotRef,
          snapshot,
        });
      }

      /*
       * Xóa các roomSlots thuộc booking này.
       */
      slotSnapshots.forEach(
        ({ ref, snapshot }) => {
          if (
            snapshot.exists() &&
            snapshot.data()?.bookingId === bookingId
          ) {
            transaction.delete(ref);
          }
        }
      );

      /*
       * Đổi trạng thái booking thành cancelled.
       *
       * Không xóa booking để MyBookingsScreen
       * vẫn hiển thị lịch sử "Đã hủy".
       */
      transaction.update(bookingRef, {
        status: 'cancelled',
        cancelledAt: Timestamp.now(),
      });
    }
  );
}
export async function adminCancelBooking({
  bookingId,
  roomId,
  date,
  startTime,
  endTime,
}: Omit<CancelBookingParams, 'userId'>) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  if (end <= start) {
    throw new Error(
      'Khoảng thời gian đặt phòng không hợp lệ.'
    );
  }

  const slots = createSlots(
    startTime,
    endTime
  );

  if (slots.length === 0) {
    throw new Error(
      'Không tìm thấy slot của booking.'
    );
  }

  await runTransaction(
    db,
    async (transaction) => {
      const bookingRef = doc(
        db,
        'bookings',
        bookingId
      );

      const bookingSnapshot =
        await transaction.get(bookingRef);

      if (!bookingSnapshot.exists()) {
        throw new Error(
          'Không tìm thấy lịch đặt phòng.'
        );
      }

      const bookingData =
        bookingSnapshot.data();

      if (bookingData.status === 'cancelled') {
        throw new Error(
          'Lịch đặt phòng này đã được hủy.'
        );
      }

      const slotRefs = getBookingSlotRefs(
  roomId,
  date,
  slots
);

      const slotSnapshots = [];

      for (const slotRef of slotRefs) {
        const snapshot =
          await transaction.get(slotRef);

        slotSnapshots.push({
          ref: slotRef,
          snapshot,
        });
      }

      slotSnapshots.forEach(
        ({ ref, snapshot }) => {
          if (
            snapshot.exists() &&
            snapshot.data()?.bookingId === bookingId
          ) {
            transaction.delete(ref);
          }
        }
      );

      transaction.update(bookingRef, {
        status: 'cancelled',
        cancelledAt: Timestamp.now(),
        cancelledBy: 'admin',
      });
    }
  );
}