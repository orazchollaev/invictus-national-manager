import type { CommentaryText } from "@/engine/match/commentary"

/** Live commentary in Vietnamese; same placeholders as the English set. */
const commentary: CommentaryText = {
  assist: " Kiến tạo: {a}.",
  forward: "lên phía trước",
  lane: {
    left: "bên cánh trái",
    centre: "xuyên qua trung lộ",
    right: "bên cánh phải",
  },
  shots: {
    long: {
      goal: [
        "VÀO! {p} sút xa và bóng đi thẳng vào lưới!{assist}",
        "VÀO! Một cú sét đánh của {p} từ ngoài vòng cấm!{assist}",
      ],
      "shot-saved": [
        "{p} thử vận may từ xa — {o} ôm gọn bóng.",
        "Cú sút xa của {p}, bị {o} bắt chắc.",
      ],
      "shot-wide": [
        "{p} sút xa. Đi chệch khung thành.",
        "{p} thử sức từ cự ly hai mươi lăm mét — bóng bay qua xà.",
      ],
      "shot-blocked": ["Cú sút xa của {p} bị {o} chặn lại."],
      woodwork: ["{p} dội khung thành từ cự ly xa!"],
    },
    close: {
      goal: [
        "VÀO! {p} đệm bóng vào lưới từ cự ly gần!{assist}",
        "VÀO! {p} đệm vào đường căn lùi!{assist}",
      ],
      "shot-saved": ["{o} cứu thua khó tin trước cú sút cận thành của {p}!"],
      "big-chance-missed": [
        "{p} bỏ lỡ khó tin từ cự ly sáu mét!",
        "Bóng nằm sẵn trước mặt {p}... và anh sút chệch ra ngoài!",
      ],
    },
    header: {
      goal: [
        "VÀO! {p} bật cao nhất và đánh đầu vào lưới!{assist}",
        "VÀO! Một cú đánh đầu sừng sững của {p}!{assist}",
      ],
      "shot-saved": [
        "{p} đánh đầu trúng bóng, nhưng {o} cản phá.",
        "Cú đánh đầu của {p} — bóng đi thẳng vào tay {o}.",
      ],
      "shot-wide": ["{p} đánh đầu bay qua xà.", "{p} đón được quả tạt nhưng cú đánh đầu đi chệch."],
      woodwork: ["Cú đánh đầu của {p} dội xà ngang!"],
      "big-chance-missed": ["{p} đánh đầu không bị kèm mà không trúng đích!"],
    },
    "one-on-one": {
      goal: [
        "VÀO! {p} qua thủ môn và ghi bàn!{assist}",
        "VÀO! {p} bình tĩnh trong tình huống một đối một và lốp bóng qua thủ môn!{assist}",
      ],
      "shot-saved": [
        "{p} thoát xuống một mình... {o} dang rộng người và cản phá!",
        "Xuất sắc, {o}! Anh đứng vững trong tình huống một đối một với {p}.",
      ],
      "big-chance-missed": [
        "{p} thoát xuống đối mặt khung thành... và sút chệch! Bỏ lỡ không tưởng!",
        "{p} đối mặt thủ môn và sút lệch cột dọc!",
      ],
    },
    "free-kick": {
      goal: [
        "VÀO! {p} đưa quả đá phạt đập vào góc cao khung thành!",
        "VÀO! Một quả đá phạt tuyệt đẹp của {p}!",
      ],
      "shot-saved": [
        "{p} đá phạt thẳng vào khung thành — {o} đẩy bóng ra ngoài xà!",
        "Quả đá phạt của {p} bị {o} cản phá.",
      ],
      "shot-wide": [
        "Quả đá phạt của {p} bay qua xà.",
        "{p} đá phạt xoáy bóng, đi sượt qua cột dọc.",
      ],
      "shot-blocked": ["Quả đá phạt của {p} dội vào hàng rào."],
      woodwork: ["Quả đá phạt của {p} dội cột dọc!"],
    },
    rebound: {
      goal: [
        "VÀO! {p} lao vào đệm bóng bật ra!",
        "VÀO! Thủ môn không giữ được bóng và {p} là người nhanh chân nhất!",
      ],
      "shot-saved": ["{p} bồi thêm, nhưng {o} lại cản phá!"],
      "shot-wide": ["{p} vội vàng sút bóng bật ra và bóng đi chệch."],
    },
  },
  moves: {
    counter: { before: "Phản công! ", after: " Một đợt phản công chí mạng." },
    press: {
      before: "Cướp lại bóng ngay trên sân đối phương! ",
      after: " Phải trả giá vì mất bóng.",
    },
  },
  lines: {
    kickoff: [
      "Trận đấu bắt đầu!",
      "Trọng tài thổi còi và {team:home} giao bóng.",
      "Bóng lăn. Chúng ta bắt đầu thôi.",
    ],
    "half-time": [
      "Tiếng còi báo hết hiệp một vang lên.",
      "Hiệp một kết thúc.",
      "Nghỉ giữa hiệp. Các cầu thủ đi vào đường hầm.",
    ],
    "second-half": ["Hiệp hai bắt đầu.", "Bóng lại lăn cho bốn mươi lăm phút còn lại."],
    "full-time": ["Trọng tài thổi còi mãn cuộc!", "Kết thúc rồi!", "Hết giờ."],
    "et-start": ["Hiệp phụ bắt đầu. Thêm ba mươi phút để phân định.", "Hiệp phụ đã đến."],
    "et-half-time": ["Nghỉ giữa hiệp phụ. Còn mười lăm phút."],
    "et-second-half": ["Mười lăm phút cuối của hiệp phụ bắt đầu."],
    "et-end": [
      "Vẫn chưa có đội nào hơn. Sẽ phải đá luân lưu!",
      "Hiệp phụ không thể phân thắng bại — phải đến loạt luân lưu.",
    ],
    attack: [
      "{p} đưa bóng lên cho {team} {lane}, nhưng {o} kịp ngăn chặn.",
      "{team} triển khai bóng {lane}, nhưng đường chuyền cuối bị {o} cắt.",
      "{p} tìm kiếm khoảng trống. {o} đọc tình huống rất tốt.",
      "{team} triển khai kiên nhẫn, nhưng đường chuyền cuối lại đi chệch.",
      "{p} thử một đường chọc khe — bị {o} cắt đứt.",
    ],
    goal: [
      "VÀO! {p} đưa bóng vào lưới cho {team}!{assist}",
      "VÀO! {p} không bỏ lỡ cơ hội!{assist}",
      "VÀO! Một pha dứt điểm tuyệt vời của {p}!{assist}",
      "VÀO! {p} đặt bóng gọn vào lưới cho {team}!{assist}",
      "VÀO! {p} có mặt đúng lúc để đệm bóng vào lưới!{assist}",
    ],
    "own-goal": [
      "PHẢN LƯỚI! {p} đưa bóng vào lưới nhà. Một thảm họa với anh.",
      "PHẢN LƯỚI! {p} chỉ kịp đổi hướng bóng qua đầu thủ môn nhà.",
    ],
    "penalty-awarded": [
      "PHẠT ĐỀN! {o} hạ gục {p} trong vòng cấm!",
      "Trọng tài chỉ vào chấm phạt đền! {p} bị {o} phạm lỗi.",
    ],
    "pen-goal": [
      "VÀO! {p} đánh lừa thủ môn trên chấm phạt đền!",
      "VÀO! {p} thực hiện thành công quả phạt đền!",
    ],
    "pen-saved": [
      "CỨU THUA! {o} đoán đúng hướng và cản phá quả phạt đền của {p}!",
      "Quả phạt đền của {p} bị {o} cản phá!",
    ],
    "pen-miss": [
      "{p} sút phạt đền bay vọt xà ngang!",
      "{p} đá phạt đền chệch cột dọc! Một sự nhẹ nhõm khổng lồ.",
    ],
    "shot-saved": [
      "{p} thử thách thủ môn — {o} cản phá.",
      "Cú sút tốt của {p}, nhưng {o} ngã người đón bóng.",
      "{p} sút vào khung thành. {o} bắt bóng dễ dàng.",
      "Pha cản phá xuất sắc của {o} từ chối {p}!",
    ],
    "shot-wide": [
      "{p} sút xa. Đi chệch.",
      "{p} dứt điểm nhưng bóng bay qua xà.",
      "{p} vội vàng ra chân và cơ hội vụt mất.",
      "{p} sút xoáy, bóng đi sượt cột dọc.",
    ],
    "shot-blocked": [
      "{p} sút — bị {o} chặn lại!",
      "Cú dứt điểm của {p} bị chặn đứng.",
      "Pha cản phá dũng cảm của {o} để ngăn {p}.",
    ],
    woodwork: [
      "{p} dội cột dọc!",
      "Dội xà ngang! {p} suýt nữa thì ghi bàn!",
      "{p} làm rung khung thành!",
    ],
    "big-chance-missed": [
      "Cơ hội quá lớn! {p} lẽ ra phải ghi bàn nhưng lại đá chệch!",
      "{p} thoát xuống một mình... và bỏ lỡ! Không thể tin nổi.",
      "{p} chỉ còn mỗi thủ môn phải vượt qua mà lại sút hỏng!",
    ],
    corner: [
      "Phạt góc cho {team}.",
      "{team} giành được một quả phạt góc.",
      "Bóng bị chạm ra ngoài, phạt góc cho {team}.",
    ],
    "free-kick": [
      "Đá phạt cho {team} ở vị trí nguy hiểm.",
      "{p} bị phạm lỗi. Đá phạt, và nằm trong tầm sút.",
    ],
    foul: [
      "{p} phạm lỗi với {o}.",
      "{p} vào bóng từ phía sau {o}. Đá phạt.",
      "{p} va chạm với {o}. Trọng tài thổi phạt.",
    ],
    yellow: ["Thẻ vàng cho {p}.", "{p} bị ghi tên vào sổ.", "Trọng tài rút thẻ vàng với {p}."],
    "second-yellow": [
      "Thẻ vàng thứ hai cho {p}! Anh bị đuổi khỏi sân!",
      "{p} nhận thẻ vàng thứ hai và bị truất quyền thi đấu!",
    ],
    red: ["THẺ ĐỎ! {p} bị đuổi khỏi sân!", "Thẻ đỏ trực tiếp cho {p}! {team} chỉ còn mười người."],
    offside: [
      "{p} bị cắm cờ việt vị.",
      "Cờ phất lên chống lại {p}.",
      "{p} bứt tốc quá sớm. Việt vị.",
    ],
    injury: [
      "{p} nằm sân và cần được chăm sóc.",
      "Lo ngại cho {team}: {p} bị đau.",
      "{p} dừng lại, ôm lấy chân.",
    ],
    sub: [
      "Thay người bên phía {team}: {p} vào sân thay {o}.",
      "{team} có sự thay đổi. {o} rời sân, {p} vào sân.",
    ],
    tactics: ["{team} thay đổi cách tiếp cận.", "Băng ghế huấn luyện của {team} đang điều chỉnh."],
    "shootout-goal": ["{p} ghi bàn.", "{p} thực hiện thành công.", "{p} — vào góc cao!"],
    "shootout-miss": ["{p} đá hỏng!", "Cú sút của {p} bị cản phá!", "{p} sút bay vọt xà!"],
    "shootout-end": ["{team} thắng loạt luân lưu!", "{team} mới là đội giữ được bình tĩnh!"],
  },
}

export default commentary
