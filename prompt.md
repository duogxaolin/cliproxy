phân tích https://github.com/kaitranntt/ccs tìm hiểu cách hoạt động của
      CLI Proxy.
tôi muốn làm một website sử dụng CLIProxy như này nhưng không phụ thuộc vào CCS. mà là custom.
CLI vẫn được truy cập nhanh qua http://103.77.173.186:3000/cliproxy/control-panel
      vẫn giữ nguyên chức năng hiện tại cuủa cliproxy

website sẽ là website bán api cho user. phân quyền admin và user.
chỉ admin mới thấy và truy cập vào được clipproxy
website sẽ tạo một trung chuyển để gửi đi api.
ví dụ admin sẽ thiết lập model tên là claude-sonnet-4-5-20250929 thì nó sẽ là shadow để truy cập vào api
"ANTHROPIC_BASE_URL": "http://127.0.0.1:8317/api/provider/agy",
    "ANTHROPIC_AUTH_TOKEN": "ccs-internal-managed",
    "ANTHROPIC_MODEL": "gemini-claude-opus-4-5-thinking",
  gpt-5.1-codex-max thì nó sẽ là shadow để truy cập vào api
  "ANTHROPIC_BASE_URL": "http://127.0.0.1:8317/api/provider/codex",
     "ANTHROPIC_AUTH_TOKEN": "ccs-internal-managed",
     "ANTHROPIC_MODEL": "gpt-5.1-codex-max",
  tương tự với các models khác, có thể custom url,token và models nguồn

admin sẽ cấp cho các user số $ dùng api.
mỗi khi user dùng api sẽ trừ số $ của user đó đi.
user để dùng api sẽ tạo khóa api với các thông tin
Tên token
My API Key
Models


Tất cả models
Quota


Không giới hạn
Ngày hết hạn


Không hết hạn

có thống kê số lần sử dụng, tần suất,credit đã dùng theo thời gian, theo key tạo, theo model


website có themes trắng đẹp mắt, dễ nhìn. dùng tailwincss

build bằng docker

 remote vào git remote add origin https://github.com/duogxaolin/cliproxy.git
 # BẮT BUỘC COMMIT VÀ PUSH LÊN GITHUB ĐỂ CÓ THỂ ROLLBACK NẾU CẦN SAU KHI XONG MỖI 1 CHỨC NĂNG LỚN CHỨ KHÔNG PHẢI PUSH LÚC XONG ALL TASK (mỗi lần commit dùng git add . để k bỏ lỡ gì, GỘP NHỮNG CHỈNH SỬA CÙNG CHỨC NĂNG VÀO 1 COMMIT- là xong 1 nhóm chức năng sẽ commit luôn rồi đến làm cái khác ).
# với sửa SQL nhớ thêm 1 file trong folder database để dễ đồng bộ)
# trước khi bắt đầu code kiểm tra xem code đã được commit và push lên github chưa nếu chưa thì commit và push lên github trước khi bắt đầu code. nếu đã commit và push lên github thì bắt đầu code
# Mỗi khi xong một chức năng sẽ thêm file chi tiết về cách hoạt động, quy tắc của nó vào folder docs để dễ dàng truy cập và tham khảo sau này.
# Mỗi khi code phải kiểm tra được nó đã được thực hiện chưa trong docs để đảm bảo đúng cấu trúc.
# code tuân thủ nguyên tắc **YAGNI** (You Aren't Gonna Need It), **KISS** (Keep It Simple, Stupid), và **DRY** (Don't Repeat Yourself).
