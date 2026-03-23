import { useState, useAsyncData, useNuxtApp } from '#imports'

const defaultNews = [
  {
    image: 'https://picsum.photos/seed/machine1/600/400',
    tag: 'MÁY NÔNG NGHIỆP',
    title: 'Top 5 Máy Xới Đất Mini Đáng Mua Nhất Cho Vụ Mùa 2025',
    description: 'Máy xới đất mini ngày càng được bà con nông dân ưa chuộng nhờ tính linh hoạt, dễ sử dụng và giá thành phải chăng. Dưới đây là 5 mẫu máy xới đất đáng cân nhắc nhất...',
    link: '#',
    content: `
      <h2>1. Giới thiệu chung về máy xới đất mini</h2>
      <p>Với sự phát triển của nền nông nghiệp hiện đại, việc ứng dụng máy móc vào sản xuất không còn quá xa lạ. Trong đó, máy xới đất mini đã trở thành "trợ thủ đắc lực" cho bà con nhà nông, đặc biệt là những hộ gia đình có diện tích canh tác vừa và nhỏ.</p>
      <img src="https://picsum.photos/seed/machine1/800/500" alt="Máy xới đất mini" style="max-width: 100%; border-radius: 8px; margin: 20px 0;" />
      <h2>2. Tại sao nên chọn máy xới đất mini?</h2>
      <ul>
        <li><strong>Thiết kế nhỏ gọn:</strong> Dễ dàng di chuyển và len lỏi vào từng gốc cây, luống rau.</li>
        <li><strong>Đa năng:</strong> Ngoài xới đất, máy còn có thể kết hợp với các phụ kiện để lên luống, bừa, làm cỏ...</li>
        <li><strong>Tiết kiệm năng lượng:</strong> Các model mới năm 2025 đều được tối ưu hóa động cơ, giúp giảm tiêu hao nhiên liệu.</li>
      </ul>
      <h2>3. Top 5 máy xới đất bán chạy nhất 2025</h2>
      <p>Năm nay, các dòng máy từ Honda (Nhật Bản), Yamaha và Kama vẫn đang dẫn đầu thị trường. Dòng Honda GX-35 với động cơ bền bỉ và độ rung thấp là lựa chọn hàng đầu cho chị em phụ nữ làm vườn. Kế đến là máy xới đất động cơ dầu Kama với lực phay mạnh mẽ, chuyên trị các loại đất cứng, đất đồi.</p>
      <p><i>Hãy liên hệ ngay với Tuấn Minh để được tư vấn dòng máy phù hợp nhất với loại đất và nhu cầu canh tác của gia đình bạn nhé!</i></p>
    `
  },
  {
    image: 'https://picsum.photos/seed/machine2/600/400',
    tag: 'MẸO CHỌN MÁY BƠM NƯỚC',
    title: 'Kinh Nghiệm Chọn Mua Máy Bơm Nước Phục Vụ Sinh Hoạt Và Sản Xuất',
    description: 'Việc lựa chọn máy bơm nước phù hợp không chỉ giúp cung cấp đủ lượng nước mà còn tiết kiệm điện năng đáng kể, đặc biệt là vào mùa khô hạn kéo dài...',
    link: '#',
    content: `
      <h2>1. Vai trò của máy bơm nước trong mùa khô</h2>
      <p>Mùa khô kéo dài luôn là nỗi vất vả của sinh hoạt và nông nghiệp. Việc sở hữu một chiếc máy bơm lưu lượng lớn, hoạt động ổn định là ưu tiên số một. Tuy nhiên, giữa thị trường có hàng trăm hãng máy, việc chọn ra một sản phẩm tốt không hề dễ dàng.</p>
      <img src="https://picsum.photos/seed/machine2/800/500" alt="Máy bơm nước" style="max-width: 100%; border-radius: 8px; margin: 20px 0;" />
      <h2>2. Các tiêu chí khi mua máy bơm</h2>
      <h3>A. Bơm dùng trong sinh hoạt</h3>
      <p>Nếu là bơm nước thủy cục lên bồn chứa gia đình (tầng 1-3), bạn chỉ cần dòng bơm chân không công suất nhỏ (125W - 200W). Ưu điểm của dòng này là cực kì êm ái, đóng ngắt tự động chính xác.</p>
      <h3>B. Bơm tưới tiêu nông nghiệp</h3>
      <p>Đối với việc tưới cafe, hồ tiêu, sầu riêng hay bơm nước chống ngập, cần dòng bơm ly tâm trục đứng hoặc trục ngang công suất lớn từ 1.5HP - 5HP. Lưu ý xem xét chỉ số "Lưu lượng cực đại (Qmax)" và "Cột áp cực đại (Hmax)".</p>
      <h2>3. Khuyến nghị hãng máy bơm</h2>
      <p>Panasonic và Pentax (Italy) là hai thương hiệu bảo chứng cho chất lượng và độ bền. Ngoài ra đối với máy bơm ruộng, dòng bơm xăng Yamaha là lựa chọn cơ động vì không phụ thuộc vào nguồn điện lưới.</p>
    `
  },
  {
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=600&q=80',
    tag: 'REVIEW THIẾT BỊ',
    title: 'Đánh Giá Máy Phát Điện Honda: Có Bền Bỉ Và Nhạy Nổ Như Lời Đồn?',
    description: 'Thương hiệu Honda từ lâu đã nổi tiếng với các dòng máy công nghiệp và nông nghiệp. Cùng Tuấn Minh review chi tiết các dòng máy phát điện của hãng này...',
    link: '#',
    content: `
      <h2>Tổng quan về máy phát điện Honda</h2>
      <p>Với chất lượng Nhật Bản và độ bền cao, hãng máy Honda được mệnh danh là hàng "quốc dân" tại thị trường Việt Nam. Gần đây, dòng máy phát điện của hãng liên tục cháy hàng mỗi dịp Hè về khi tình trạng cúp điện diễn ra thường xuyên.</p>
      <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80" alt="Máy phát điện Honda" style="max-width: 100%; border-radius: 8px; margin: 20px 0;" />
      <h2>Những ưu điểm vượt trội</h2>
      <ul>
        <li><strong>Động cơ thế hệ mới:</strong> Tiếng ồn được giảm thiểu tối đa, vỏ bọc chống ồn cách âm tốt thích hợp cho cả khu dân cư đông đúc.</li>
        <li><strong>Nhạy nổ:</strong> Củ phát 100% dây đồng kết hợp bộ điều chỉnh điện áp tự động (AVR), chỉ cần kéo hoặc đề là máy hoạt động ngay ở lần thử đầu tiên.</li>
        <li><strong>Siêu tiết kiệm:</strong> Động cơ tối ưu khả năng đốt cháy nhiên liệu, hoạt động nhiều giờ liên tục mà không sinh nhiệt quá mức.</li>
      </ul>
      <h2>Kết luận</h2>
      <p>Nếu bạn đang tìm kiếm một tổ máy để backup năng lượng cho gia đình, cửa hàng quy mô nhỏ, máy phát điện Honda 3kw – 5kw là lựa chọn hoàn hảo cả về giá trị lẫn độ bền theo thời gian.</p>
    `
  },
  {
    image: 'https://picsum.photos/seed/machine4/600/400',
    tag: 'HƯỚNG DẪN BẢO DƯỠNG',
    title: 'Hướng Dẫn Bảo Dưỡng Máy Cắt Cỏ Đúng Chuẩn Giúp Kéo Dài Tuổi Thọ',
    description: 'Sau một thời gian dài sử dụng, máy cắt cỏ cần được vệ sinh và bảo dưỡng định kỳ để đảm bảo công suất hoạt động tốt nhất. Hãy làm theo các bước cơ bản sau...',
    link: '#',
    content: `
      <h2>1. Tại sao cần bảo dưỡng máy cắt cỏ?</h2>
      <p>Máy cắt cỏ hoạt động trong môi trường cực kỳ khắc nghiệt: bụi bẩn, cỏ ẩm ướt, sỏi đá nảy trúng. Nếu bỏ bê việc dọn rửa bảo trì, máy dễ gặp tình trạng: khó nổ, hao xăng, chết máy giữa chừng, thậm chí cháy động cơ tốn hàng triệu đồng sửa chữa.</p>
      <img src="https://picsum.photos/seed/machine4/800/500" alt="Máy cắt cỏ" style="max-width: 100%; border-radius: 8px; margin: 20px 0;" />
      <h2>2. Quy trình 4 bước bảo dưỡng cơ bản</h2>
      <ol>
        <li><strong>Vệ sinh mâm cắt và bugi:</strong> Sau mỗi buổi làm, gỡ hết vụn cỏ quấn vào lam cắt. Mỗi 50 giờ hoạt động, cần tháo Bugi ra dùng bàn chải kẽm vệ sinh muội than khô.</li>
        <li><strong>Kiểm tra và xả xăng thừa:</strong> Xăng pha nhớt để lâu sẽ biến chất, tạo thành lớp keo làm tắc bình xăng con (chế hòa khí). Tuyệt đối phải xả sạch bình xăng nếu không dùng máy quá 1 tháng.</li>
        <li><strong>Vệ sinh lọc gió:</strong> Lọc gió bám bụi sẽ khiến máy bị "ngộp", công suất giảm rõ rệt. Giặt sạch bằng nước ấm hoặc thay phễu giấy mới tùy dòng máy.</li>
        <li><strong>Tra mỡ bò vào bánh răng:</strong> Định kỳ bơm mỡ tuýp vào trục khuỷu, các ổ bi và đầu bò để chuyển động cắt được êm ái, triệt tiêu ma sát.</li>
      </ol>
      <p>Tuân thủ đúng lịch bảo dưỡng này, tuổi thọ của máy sẽ tăng ít nhất gấp đôi!</p>
    `
  },
  {
    image: 'https://images.unsplash.com/photo-1544465544-1b71aee9dfa3?auto=format&fit=crop&w=600&q=80',
    tag: 'TƯ VẤN MUA HÀNG',
    title: 'Máy Bơm Chìm Và Máy Bơm Cạn: Lựa Chọn Nào Phù Hợp Cho Gia Đình?',
    description: 'Tìm hiểu ưu và nhược điểm của dòng máy bơm chìm và bơm cạn để có được lựa chọn đúng đắn và tối ưu chi phí cho nhu cầu sử dụng nước.',
    link: '#',
    content: `
      <h2>1. Giới thiệu chung</h2>
      <p>Trong các dòng máy phục vụ gia đình, bơm chìm và bơm cạn là 2 nhóm khái niệm khiến khách hàng dễ bối rối nhất. Mỗi dòng đều có cơ chế và môi trường hoạt động đặc thù.</p>
      <img src="https://images.unsplash.com/photo-1544465544-1b71aee9dfa3?auto=format&fit=crop&w=800&q=80" alt="Máy bơm chìm và máy bơm cạn" style="max-width: 100%; border-radius: 8px; margin: 20px 0;" />
      <h2>2. So sánh chi tiết</h2>
      <h3>Máy Bơm Chìm (Bơm tõm)</h3>
      <p>Hoạt động bằng cách thả chìm toàn bộ thân máy xuống ngập trong nước.</p>
      <ul>
        <li><strong>Ưu điểm:</strong> Không cần mồi nước, được làm mát bằng chính vùng nước xung quanh nên khó bị cháy. Rất thích hợp để chống ngập rút nước mùa mưa, hút nước từ giếng hố sâu.</li>
        <li><strong>Nhược điểm:</strong> Bảo trì khó, rủi ro hở điện cao nếu ống dây và vỏ máy bị nứt. Cần kiểm tra kĩ trước khi thả xuống hồ cá.</li>
      </ul>
      <h3>Máy Bơm Cạn</h3>
      <p>Lắp ráp khô ráo trên mặt đất, dùng ống hút cắm xuống nguồn nước.</p>
      <ul>
        <li><strong>Ưu điểm:</strong> An toàn tuyệt đối về điện, dễ sửa chữa thay linh kiện, được sử dụng rất phổ biến trong gia đình (hút nước lên téc).</li>
        <li><strong>Nhược điểm:</strong> Bắt buộc phải mồi đầy nước vào buồng bơm ở lần chạy đầu tiên. Tiếng ồn hoạt động to hơn bơm chìm.</li>
      </ul>
      <p>Tuỳ vào việc bạn muốn "hút sạch nước ngập" hay "đẩy nước lên lầu" mà các kỹ thuật viên tại Tuấn Minh sẽ trực tiếp tư vấn loại máy tối ưu chi phí cho bạn nhất.</p>
    `
  },
  {
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
    tag: 'MÁY NÉN KHÍ',
    title: 'Tại Sao Nên Chọn Máy Nén Khí Không Dầu Dùng Trong Nha Khoa, Y Tế?',
    description: 'Khám phá lý do vì sao máy nén khí không dầu lại đóng vai trò tối quan trọng để đảm bảo tiêu chuẩn y khoa và sức khỏe người bệnh...',
    link: '#',
    content: `
      <h2>1. Độ tinh khiết là ưu tiên số một</h2>
      <p>Đối với các tiệm sửa xe, xưởng mộc, hơi khí nén có bị lẫn dầu nhớt cũng không thành vấn đề. Nhưng trong y khoa (đặc biệt là Răng Hàm Mặt), luồng hơi đi vào miệng bệnh nhân bắt buộc phải SẠCH 100%, không mùi, không hóa chất.</p>
      <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80" alt="Máy nén khí nha khoa" style="max-width: 100%; border-radius: 8px; margin: 20px 0;" />
      <h2>2. Cơ chế máy nén khí không dầu</h2>
      <p>Dòng máy nén khí không dầu được tráng lớp nhựa chịu nhiệt Teflon trên thân xi lanh. Động cơ bơm mà không cần dầu bôi trơn, nhờ đó không khí đầu ra hoàn toàn tinh khiết. Kèm theo bộ lọc tách nước, bệnh nhân sẽ không ngửi thấy bất kì mùi khét nồng nào của động cơ.</p>
      <h2>3. Lợi ích thêm</h2>
      <ul>
        <li>Giảm tiếng ồn xuống mức cực thấp (silence compressor), tạo không gian yên tĩnh thư giãn tại phòng khám.</li>
        <li>Bảo vệ độ bền của các tay khoan nha khoa đắt tiền (tránh bị cặn dầu làm nghẽn trục xoay).</li>
      </ul>
      <p>Các nhãn hàng nổi tiếng trong phân khúc này bao gồm Pegasus, Wing, Puma đều đang được phân phối chính hãng tại Điện Máy Tuấn Minh.</p>
    `
  },
  {
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=600&q=80',
    tag: 'CHỐNG HÀNG GIẢ',
    title: 'Cách Phân Biệt Máy Nông Nghiệp Chính Hãng Honda Và Hàng Nhái',
    description: 'Thị trường hiện nay xuất hiện nhiều máy nông nghiệp Honda bị làm giả tinh vi. Dưới đây là cách kiểm tra tem mác và chi tiết máy để nhận biết hàng thật.',
    link: '#',
    content: `
      <h2>1. Tệ nạn hàng trôi nổi kém chất lượng</h2>
      <p>Vì thương hiệu quá nổi tiếng, hiện có hàng trăm xưởng gia công đang "chế" lại vỏ máy giống 90% các dòng máy xịt thuốc, cưa xích của Honda. Máy giả thường dùng kim loại tái chế, bộ nong dỏm, rất mau hỏng sau 3 - 4 tháng sử dụng.</p>
      <img src="https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=80" alt="Phân biệt thật giả máy Honda" style="max-width: 100%; border-radius: 8px; margin: 20px 0;" />
      <h2>2. Ba điểm then chốt để kiểm tra</h2>
      <ol>
        <li><strong>Dập nổi logo:</strong> Trên các nòng máy và sườn lốc máy của hàng thật, biểu tượng Honda được đúc khối, dập nổi kim loại cực kì sắc sảo. Hàng giả thường dán decal hoặc in phun lem nhem.</li>
        <li><strong>Tem bào hành điện tử:</strong> Mọi mặt hàng chính hãng đều có tem cào phủ bạc chứa mã SMS. Quý khách chỉ việc nhắn tin mã số lên tổng đài hãng là sẽ biết thật hay giả ngay.</li>
        <li><strong>Nghe tiếng máy:</strong> Máy Honda thật khi kéo ga lên tiếng gầm giòn giã, dứt khoát chứ không bị nghẹt xả hay rè rền âm kim loại.</li>
      </ol>
      <p>Để yên tâm tuyệt đối, người tiêu dùng nên chọn lựa mua tại hệ thống Đại Lý Ủy Quyền chính ngạch như Tuấn Minh, có giấy tờ xuất kho đầy đủ.</p>
    `
  },
  {
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
    tag: 'MÁY CÔNG NGHIỆP',
    title: 'Ứng Dụng Của Máy Nghiền Bột Trong Nông Nghiệp Hiện Đại',
    description: 'Máy nghiền bột giúp việc chế biến thức ăn chăn nuôi hoặc xay xát nông sản trở nên nhanh chóng, hiệu quả. Tham khảo ngay các dòng máy bán chạy.',
    link: '#',
    content: `
      <h2>1. Tự cung tự cấp thức ăn chăn nuôi</h2>
      <p>Chăn nuôi khép kín đang là xu thế. Việc mua một chiếc máy nghiền bột giúp bà con tận dụng trực tiếp nguồn nông sản thu hoạch được (lúa, ngô, khoai mạch) để nghiền nhuyễn nấu cám cho gia súc, gia cầm. Vừa đảm bảo hạt không bị mốc, vừa giảm 30-40% chi phí mua túi cám công nghiệp đắt đỏ.</p>
      <img src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80" alt="Máy nghiền bột đa năng" style="max-width: 100%; border-radius: 8px; margin: 20px 0;" />
      <h2>2. Xay xát mỹ phẩm, dược liệu</h2>
      <p>Máy nghiền bột inox với lồng búa đập siêu tốc không chỉ dùng nuôi heo gà. Các phiên bản mini đang cực hot khi giúp nghiền các loại hạt ngủ cốc thành bột mịn màng làm bột dinh dưỡng, hoặc nghiền lá nam, thảo dược trong đông y.</p>
      <h2>3. Các dòng máy hiện hành phổ biến</h2>
      <ul>
        <li><strong>Máy nghiền búa đập:</strong> Công suất khủng, chuyên ngấu nghiến bắp hạt nguyên cùi, cành cây khô. Tốc độ cực nhanh.</li>
        <li><strong>Máy nghiền cối đá/ mâm xoay:</strong> Nghiền từ từ, bột ra rất mịn, ít sinh nhiệt, bảo toàn dinh dưỡng hạt. Ưa chuộng trong làm thực phẩm bán lẻ.</li>
      </ul>
      <p>Tùy theo nhu cầu và năng suất (từ 50kg/h đến 5 Tấn/h), đội ngũ kỹ thuật Tuấn Minh luôn sẵn sàng lắp đặt và hỗ trợ trọn đời cho bà con.</p>
    `
  }
]

const generateSlug = (str: string) => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/^-+|-+$/g, '')
}

const generateMockContent = (title: string, image: string, desc: string) => {
  return \`
    <p>Chào mừng bạn đến với bài viết <strong>\${title}</strong>.</p>
    <p>\${desc}</p>
    <img src="\${image}" alt="\${title}" style="max-width: 100%; border-radius: 8px; margin: 20px 0;" />
    <h2>Phần 1: Giới thiệu chung</h2>
    <p>Đây là nội dung chi tiết được tự động tạo phục vụ cho ví dụ. Trong phần này, bạn sẽ tìm hiểu thêm về các ứng dụng và đặc điểm nổi bật của máy móc và dịch vụ mà Tuấn Minh cung cấp.</p>
    <img src="https://picsum.photos/seed/\${Math.random().toString(36).substring(7)}/800/500" alt="Random image" style="max-width: 100%; border-radius: 8px; margin: 20px 0;" />
    <h2>Phần 2: Lợi ích mang lại</h2>
    <ul>
      <li>Hiệu suất cao, tiết kiệm thời gian.</li>
      <li>Dễ dàng vận hành và bảo trì.</li>
      <li>Chi phí đầu tư hợp lý, mau thu hồi vốn.</li>
    </ul>
    <p>Với nhiều năm kinh nghiệm, chúng tôi luôn mang lại giá trị tốt nhất cho Quý khách hàng.</p>
  \`
}

export const useNews = () => {
  const newsList = useState<any[]>('site-news', () => [])
  
  const isLoaded = useState('site-news-loaded', () => false)

  const loadNews = async () => {
    if (!isLoaded.value && import.meta.client) {
      try {
        const data = await $fetch<any[]>('/api/news')
        if (Array.isArray(data) && data.length > 0) {
          newsList.value = data.map(item => ({
            ...item,
            slug: item.slug || generateSlug(item.title),
            content: item.content || generateMockContent(item.title || '', item.image || '', item.description || '')
          }))
        } else {
          // Fallback to defaultNews if empty
          newsList.value = JSON.parse(JSON.stringify(defaultNews.map(n => ({
            ...n,
            slug: n.slug || generateSlug(n.title),
            content: n.content || generateMockContent(n.title, n.image, n.description)
          }))))
        }
      } catch (e) {
        console.error('Failed to load news', e)
        // Fallback
        if (newsList.value.length === 0) {
          newsList.value = JSON.parse(JSON.stringify(defaultNews.map(n => ({
            ...n,
            slug: n.slug || generateSlug(n.title),
            content: n.content || generateMockContent(n.title, n.image, n.description)
          }))))
        }
      }
      isLoaded.value = true
    }
  }

  const saveNews = async () => {
    if (import.meta.client) {
      try {
        await $fetch('/api/news', {
          method: 'POST',
          body: newsList.value
        })
      } catch (e: any) {
        console.error('Failed to save news', e)
        alert('Có lỗi khi lưu bài viết! Giao diện đã được cập nhật nhưng lưu file thất bại.\\nVui lòng khởi động lại server Nuxt (npm run dev) nếu API /api/news bị lỗi 404.\\nLỗi: ' + e.message)
      }
    }
  }

  const addNews = async (item: any) => {
    const title = item.title || 'Bài viết mới'
    const image = item.image || 'https://picsum.photos/seed/machine1/600/400'
    const desc = item.description || ''
    
    const newItem = {
      image,
      tag: item.tag || 'TIN TỨC',
      title,
      description: desc,
      slug: item.slug || generateSlug(title),
      content: item.content || generateMockContent(title, image, desc),
      link: item.link || '#'
    }
    newsList.value.unshift(newItem)
    await saveNews()
  }

  const updateNews = async (index: number, item: any) => {
    if (index >= 0 && index < newsList.value.length) {
      const title = item.title || newsList.value[index].title
      const newSlug = item.slug || generateSlug(title)
      newsList.value[index] = { ...newsList.value[index], ...item, slug: newSlug }
      await saveNews()
    }
  }

  const deleteNews = async (index: number) => {
    if (index >= 0 && index < newsList.value.length) {
      newsList.value.splice(index, 1)
      await saveNews()
    }
  }

  return {
    newsList,
    loadNews,
    saveNews,
    addNews,
    updateNews,
    deleteNews
  }
}
