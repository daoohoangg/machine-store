import { useState } from '#imports'

const defaultPolicies = {
  thanhToan: {
    id: 'thanh-toan',
    title: 'Chính Sách Thanh Toán',
    icon: 'fa-credit-card',
    updatedAt: '2025-12-31 11:36:08',
    content: `<h2>Hình thức thanh toán</h2>
<p><strong>1. Khách hàng thanh toán trực tiếp tại địa chỉ văn phòng:</strong></p>
<ul>
  <li><em>Tại Hà Nội:</em><br>
  Địa chỉ: Số 04/202 Cổ Linh – phường Long Biên – QUận Long Biên - Thành Phố Hà Nội<br>
  SĐT : 0243.6700.443 . Thời gian phục vụ : từ 8h – 17h từ thứ 2 đến thứ 7</li>
  <li><em>Tại Hồ Chí Minh:</em><br>
  Địa chỉ: 350 Quốc lộ 1A – Phường Bình Hưng Hòa B – Quận Bình Tân – Thành Phố Hồ Chí Minh<br>
  SĐT : 0283.535.1394. Thời gian phục vụ : từ 8h – 17h từ thứ 2 đến thứ 7</li>
</ul>
<p><strong>2. Khách hàng chuyển khoản qua ngân hàng :</strong></p>
<ul>
  <li><em>Ngân Hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV):</em><br>
  Chi nhánh: Hưng Yên<br>
  Chủ tài khoản: Trần Đình Tuệ / Giám đốc<br>
  Số tài khoản: 4651.0002.999999</li>
  <li><em>Ngân hàng Nông Nghiệp và Phát Triển Nông Thôn Việt Nam (AGRIBANK):</em><br>
  Chi nhánh: Long Biên – Hà Nội<br>
  Chủ tài khoản: Trần Đình Tuệ / Giám đốc<br>
  Số tài khoản: 1220.205.005.210</li>
</ul>`
  },
  khachHang: {
    id: 'khach-hang',
    title: 'Chính Sách Khách Hàng',
    icon: 'fa-users',
    updatedAt: '2026-01-27 11:03:07',
    content: `<h3>🤝 CHÍNH SÁCH KHÁCH HÀNG</h3>
<p>Shop luôn đặt <strong>quyền lợi và sự hài lòng của khách hàng</strong> lên hàng đầu. Mọi sản phẩm đều được kiểm tra kỹ trước khi giao, hỗ trợ tư vấn rõ ràng và minh bạch trong suốt quá trình mua sắm.</p>
<p>Khách hàng được hưởng đầy đủ các chính sách <strong>giao hàng, đổi trả theo quy định</strong>, cùng sự hỗ trợ nhanh chóng khi có vấn đề phát sinh.</p>
<p>Shop cam kết phục vụ tận tâm, xây dựng mối quan hệ <strong>lâu dài – uy tín – tin cậy</strong> với khách hàng.</p>`
  },
  doiTra: {
    id: 'doi-tra',
    title: 'Chính Sách Đổi Trả',
    icon: 'fa-rotate-left',
    updatedAt: '2026-01-27 10:57:20',
    content: `<h3>🔄 CHÍNH SÁCH ĐỔI TRẢ – 1 ĐỔI 1 TRONG 7 NGÀY</h3>
<p>Khách hàng được <strong>đổi 1 sản phẩm mới</strong> trong vòng <strong>07 ngày kể từ ngày nhận hàng</strong> nếu sản phẩm gặp lỗi do nhà sản xuất hoặc lỗi trong quá trình vận chuyển.</p>
<p>Sản phẩm đổi trả cần <strong>còn nguyên vẹn, chưa qua sử dụng</strong>, đầy đủ phụ kiện và bao bì kèm theo.</p>
<p>Mỗi đơn hàng <strong>áp dụng đổi 1 lần duy nhất</strong>, không hỗ trợ hoàn tiền.</p>
<p>Quý khách vui lòng liên hệ shop sớm để được hỗ trợ nhanh chóng và thuận tiện nhất.</p>`
  },
  giaoHang: {
    id: 'giao-hang',
    title: 'Chính Sách Giao Hàng',
    icon: 'fa-truck-fast',
    updatedAt: '2026-01-27 10:59:30',
    content: `<h3>🚚 CHÍNH SÁCH GIAO HÀNG – NHẬN HÀNG 1–3 NGÀY</h3>
<p>Sau khi xác nhận đơn hàng, shop tiến hành đóng gói và bàn giao cho đơn vị vận chuyển trong thời gian sớm nhất.</p>
<p>Thời gian giao hàng dự kiến <strong>từ 01–03 ngày làm việc</strong> (không tính Chủ nhật & ngày lễ), tùy khu vực nhận hàng.</p>
<p>Quý khách vui lòng <strong>kiểm tra sản phẩm khi nhận hàng</strong>; nếu có vấn đề phát sinh, liên hệ shop ngay để được hỗ trợ kịp thời.</p>
<p>Shop luôn cố gắng giao hàng đúng hẹn, đảm bảo sản phẩm đến tay khách <strong>an toàn và nguyên vẹn</strong>.</p>`
  }
}

export const useSiteSettings = () => {
  const settings = useState('site-settings', () => ({
    hotline: '0995.556.969',
    address: 'Thôn Phượng Trì, Xã Văn Giang, Tỉnh Hưng Yên',
    email: 'lehoang145817629@gmail.com',
    facebook: 'https://web.facebook.com/profile.php?id=61585011406117&locale=vi_VN&_rdc=1&_rdr#',
    zalo: '#',
    youtube: '#',
    tiktok: '#',
    policies: JSON.parse(JSON.stringify(defaultPolicies))
  }))

  const isLoaded = useState('site-settings-loaded', () => false)

  const loadSettings = () => {
    if (import.meta.client && !isLoaded.value) {
        // we defer read to avoid mismatch if it's called in setup
        setTimeout(() => {
          try {
            const saved = localStorage.getItem('site_settings')
            if (saved) {
              const parsed = JSON.parse(saved)
              // Safely merge policies so they are never lost
              if (!parsed.policies || typeof parsed.policies !== 'object' || Object.keys(parsed.policies).length === 0) {
                parsed.policies = JSON.parse(JSON.stringify(defaultPolicies))
              } else {
                parsed.policies = { ...JSON.parse(JSON.stringify(defaultPolicies)), ...parsed.policies }
              }
              settings.value = { ...settings.value, ...parsed }
            }
          } catch (e) {
            console.error('Failed to load settings', e)
          }
          isLoaded.value = true
        }, 10)
    }
  }

  loadSettings()

  return {
    settings,
    loadSettings,
    defaultPolicies
  }
}
