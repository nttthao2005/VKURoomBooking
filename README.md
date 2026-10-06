# VKURoomBooking

Ứng dụng mobile hỗ trợ **tìm kiếm và đặt phòng học/phòng máy** tại VKU.

## 1. Công nghệ

* **React Native + Expo + TypeScript**
* **Firebase Authentication** – đăng ký, đăng nhập
* **Cloud Firestore** – lưu trữ dữ liệu
* **React Navigation** – điều hướng
* **Zustand** – quản lý state dùng chung
* **TanStack Query** – quản lý dữ liệu và cache
* **React Native Animated** – animation giao diện

## 2. Chức năng

* Đăng ký, đăng nhập, đăng xuất.
* Xem danh sách phòng.
* Tìm kiếm phòng theo tên, địa điểm.
* Lọc theo sức chứa và trạng thái.
* Chọn ngày và khung giờ đặt phòng.
* Kiểm tra phòng trống theo thời gian thực.
* Đặt phòng một hoặc nhiều giờ.
* Chống đặt trùng bằng **Firestore Transaction + `roomSlots`**.
* Xem và hủy booking của cá nhân.
* Quản lý phòng với tài khoản **Admin**.
* Phân quyền người dùng bằng **Firebase Security Rules**.
* Giao diện responsive trên thiết bị mobile và animation cho danh sách phòng.

## 3. Cấu trúc chính

```text
VKURoomBooking/
├── src/
│   ├── components/      # Các component giao diện
│   ├── navigation/      # Stack và Bottom Tab Navigation
│   ├── screens/         # Các màn hình
│   ├── services/        # Firebase và xử lý booking
│   ├── store/           # Zustand store
│   └── types/            # TypeScript types
├── assets/
├── App.tsx
├── package.json
└── README.md
```

## 4. Firestore

Các collection chính:

users       → Thông tin người dùng và role
rooms       → Thông tin phòng
bookings    → Thông tin đặt phòng
roomSlots   → Các khung giờ đã được đặt


`roomSlots` được sử dụng để kiểm tra xung đột thời gian và ngăn việc đặt cùng một phòng trong cùng một khung giờ.

## 5. Cài đặt

Clone project:


git clone <GITHUB_REPOSITORY_URL>
cd VKURoomBooking

Cài dependencies: npm install
Chạy ứng dụng: npx expo start


Sau đó quét QR bằng **Expo Go** hoặc chạy trên Android Emulator.

## 6. Kiểm thử

Các chức năng chính đã được kiểm thử:

* ✅ Authentication
* ✅ Room list & search
* ✅ Capacity & status filter
* ✅ Date & time filter
* ✅ Booking
* ✅ Multi-hour booking
* ✅ Duplicate booking prevention
* ✅ Cancel booking
* ✅ My Bookings
* ✅ Admin
* ✅ Firebase Security Rules
* ✅ UI/UX & Animation

## 7. Thông tin dự án

**Môn học:** Cross-Platform Mobile App Development – VKU
**Tên project:** VKURoomBooking
**Sinh viên:** Nguyễn Thị Thanh Thảo
**GitHub:** [Repository URL]
