# Product Import Script

Script này giúp import dữ liệu product từ file JSON vào MongoDB.

## Cách sử dụng

### 1. Chuẩn bị dữ liệu

- Đặt file `makeup_data.json` vào thư mục gốc của dự án (cùng cấp với thư mục `api` và `client`)
- Đảm bảo MongoDB đang chạy
- Kiểm tra connection string trong file `.env` hoặc sử dụng default: `mongodb://localhost:27017/booking-app`

### 2. Chạy script

```bash
# Từ thư mục api
cd api
node scripts/importProducts.js

# Hoặc sử dụng npm script (nếu đã thêm vào package.json)
npm run import-products
```

### 3. Cấu trúc dữ liệu JSON

File JSON cần có cấu trúc như sau:

```json
[
  {
    "name": "Product Name",
    "image": [
      {
        "public_id": "unique_id",
        "url": "image_url"
      }
    ],
    "brand": "brand_name",
    "category": ["category_id_1", "category_id_2"],
    "description": "Product description",
    "featured": false,
    "isNewProduct": true,
    "isBestSeller": false,
    "price": 24.99,
    "countInstock": 50,
    "sold": 0,
    "ratings": {
      "average": 4.5,
      "count": 249
    }
  }
]
```

## Xử lý dữ liệu

Script sẽ tự động:

1. **Transform dữ liệu** theo schema của MongoDB
2. **Xử lý category**: Tìm category theo ID hoặc tạo mới nếu không tồn tại
3. **Kiểm tra trùng lặp**: Bỏ qua product đã tồn tại
4. **Xử lý ratings**: Tính `totalRating` từ `ratings.count`
5. **Thêm timestamp**: Tự động thêm `createAt` và `updatedAt`

## Lưu ý

- **Category ID**: Nếu category ID trong JSON không tồn tại trong database, script sẽ tạo category mới với tên `Category_{id}`
- **Trùng lặp**: Script kiểm tra trùng lặp dựa trên `name` và `brand`
- **Error handling**: Script sẽ tiếp tục import các product khác nếu một product gặp lỗi
- **Progress tracking**: Hiển thị tiến độ import mỗi 10 products

## Troubleshooting

### Lỗi kết nối MongoDB
- Kiểm tra MongoDB có đang chạy không
- Kiểm tra connection string trong `.env`

### File không tìm thấy
- Đảm bảo file `makeup_data.json` đặt đúng vị trí
- Kiểm tra đường dẫn trong script

### Lỗi validation
- Kiểm tra dữ liệu JSON có đúng format không
- Kiểm tra các trường required có đầy đủ không

## Customization

Bạn có thể chỉnh sửa script để:

- Thay đổi logic xử lý category
- Thêm validation rules
- Thay đổi cách xử lý trùng lặp
- Thêm logging chi tiết hơn
