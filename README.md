# my-flashcard

Ứng dụng từ vựng một file (`vocab-app.html`) chạy trên GitHub Pages. Tiến độ lưu trong `localStorage`; nếu cấu hình Supabase thì có thể đăng ký / đăng nhập để đồng bộ tiến độ theo tài khoản.

## Bật đăng nhập (Supabase)

1. Tạo project tại https://supabase.com.
2. Vào **SQL Editor**, chạy toàn bộ `supabase/schema.sql` (tạo bảng `user_progress` + RLS).
3. Vào **Project Settings → API**, copy *Project URL* và *anon public key*, dán vào `SUPABASE_URL` và `SUPABASE_ANON_KEY` ở đầu `<script>` trong `vocab-app.html`. (Không bao giờ dùng service-role key.)
4. Trong **Authentication → URL Configuration**, đặt Site URL là địa chỉ GitHub Pages. Tùy chọn: tắt "Confirm email" nếu muốn đăng ký xong dùng ngay.

Khi chưa cấu hình, app hoạt động như cũ (chỉ localStorage) và nút đăng nhập hiện "chưa cấu hình". Khi đăng nhập, tiến độ cục bộ được gộp với bản trên server (hợp các từ đã thuộc, lấy số lần sai lớn hơn) rồi đồng bộ mỗi khi thay đổi.
