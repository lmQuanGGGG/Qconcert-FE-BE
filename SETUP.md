# Hướng dẫn Setup Qconcert

## Cải tiến đã thực hiện

### 1. UI/UX Event Detail Page
- ✅ Cải thiện spacing và padding để text không chạm khung/card
- ✅ Thêm `break-words` cho tất cả text dài để responsive tốt hơn
- ✅ Cải thiện layout của ticket cards với better alignment
- ✅ Thêm hover effects và transitions mượt mà hơn
- ✅ Cải thiện review modal với better UX
- ✅ Thêm loading states và disabled states
- ✅ Fix bug tính tổng tiền khi chọn vé

### 2. Tích hợp Reviews System
- ✅ Model Review đã có trong database (ReviewId, EventId, UserId, Rating, Comment, CreatedAt, UpdatedAt)
- ✅ API endpoints đã hoàn thiện:
  - `GET /api/reviews/event/{eventId}` - Lấy danh sách reviews
  - `POST /api/reviews` - Tạo review mới (cần authentication)
  - `PUT /api/reviews/{reviewId}` - Cập nhật review (cần authentication)
  - `DELETE /api/reviews/{reviewId}` - Xóa review (cần authentication)
- ✅ Frontend đã tích hợp load reviews thực từ backend
- ✅ Thêm form submit review với validation
- ✅ Real-time update rating sau khi submit review

### 3. Features của Reviews
- ✅ User chỉ có thể review 1 lần cho mỗi event
- ✅ Rating từ 1-5 sao
- ✅ Comment tùy chọn
- ✅ Tự động cập nhật AverageRating và ReviewCount của event
- ✅ Hiển thị tên user và thời gian review
- ✅ Pagination support (10 reviews/page)

## Cấu trúc Database

### Reviews Table
```sql
CREATE TABLE Reviews (
    ReviewId INT PRIMARY KEY IDENTITY,
    EventId INT NOT NULL,
    UserId NVARCHAR(450) NOT NULL,
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Comment NVARCHAR(MAX),
    CreatedAt DATETIME2 NOT NULL,
    UpdatedAt DATETIME2,
    FOREIGN KEY (EventId) REFERENCES Events(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE RESTRICT
)
```

## API Endpoints

### Reviews
```
GET    /api/reviews/event/{eventId}?page=1&pageSize=10
POST   /api/reviews
PUT    /api/reviews/{reviewId}
DELETE /api/reviews/{reviewId}
```

### Request Body - Create Review
```json
{
  "eventId": 1,
  "rating": 5,
  "comment": "Sự kiện rất tuyệt vời!"
}
```

### Response - Review
```json
{
  "success": true,
  "data": {
    "reviewId": 1,
    "eventId": 1,
    "userId": "user-id",
    "userName": "Nguyễn Văn A",
    "rating": 5,
    "comment": "Sự kiện rất tuyệt vời!",
    "createdAt": "2025-12-10T10:00:00Z"
  },
  "message": "Tạo đánh giá thành công"
}
```

## Frontend Changes

### Event Detail Page (`/events/[id]/page.tsx`)
- Thêm interface `Review`
- Thêm state `reviews`, `loadingReviews`, `submittingReview`
- Thêm function `loadReviews()` để load reviews từ API
- Cải thiện `handleSubmitReview()` để call API thực
- Cải thiện UI components với better spacing và responsive design
- Thêm validation và error handling

## Cách test

1. **Xem reviews của event:**
   - Truy cập `/events/{id}`
   - Reviews sẽ tự động load từ backend

2. **Tạo review mới:**
   - Đăng nhập vào hệ thống
   - Vào trang detail của event
   - Click "Viết đánh giá của bạn"
   - Chọn số sao và nhập comment
   - Click "Gửi đánh giá"

3. **Kiểm tra validation:**
   - Không thể review 2 lần cho cùng 1 event
   - Rating phải từ 1-5
   - Cần đăng nhập mới được review

## Notes

- Database đã có sẵn table Reviews, không cần migration mới
- ReviewService đã được đăng ký trong Program.cs
- CORS đã được cấu hình để frontend có thể gọi API
- JWT Authentication đã được setup cho protected endpoints
