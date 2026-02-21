
export enum SceneChoice {
  // PHÒNG NGỦ
  BED_MINIMAL = 'Phòng ngủ minimal tone trắng–kem, giường phẳng, rèm trắng, ánh sáng cửa sổ',
  BED_HOTEL = 'Phòng ngủ “hotel vibe” sang nhẹ, drap trắng, đèn đầu giường ấm',
  BED_SCANDINAVIAN = 'Căn hộ Scandinavian, tường trắng, gỗ sáng, decor tinh gọn',
  BED_KOREAN = 'Phòng ngủ Hàn Quốc tidy, kệ nhỏ gọn, tone be, ánh nắng sớm',
  BED_JAPANDI = 'Phòng ngủ Japandi, giường thấp, tường trơn, cây xanh nhỏ',
  BED_MODERN_GRAY = 'Phòng ngủ modern gray, tường xám nhạt, đèn trần đơn giản',
  BED_PASTEL = 'Phòng ngủ pastel, tường hồng/kem nhạt, decor tối giản',
  BED_ART = 'Phòng ngủ có tranh treo tường tối giản, kệ sách gọn gàng',
  BED_WINDOW = 'Phòng ngủ có cửa sổ lớn, rèm voan, nắng rực',
  BED_BROWN_CREAM = 'Phòng ngủ tông nâu–kem, rèm 2 lớp, ánh vàng chiều',

  // PHÒNG THAY ĐỒ
  CLOSET_WALKIN = 'Walk-in closet sạch sẽ, kệ quần áo đồng màu, gương toàn thân',
  CLOSET_LUXURY = 'Phòng thay đồ sang gọn, tủ âm tường, ánh sáng trắng mềm',
  CLOSET_BOUTIQUE = 'Phòng thử đồ boutique cao cấp, gương lớn, ghế băng nhỏ',
  CLOSET_STORE = 'Phòng thử đồ store minimal, tường trơn, ánh sáng đều',
  CLOSET_GLASS = 'Khu vực trước tủ đồ kính, ánh sáng phản chiếu sang',

  // PHÒNG TẮM
  BATH_MARBLE = 'Phòng tắm marble trắng, gương lớn, đèn vàng nhẹ',
  BATH_MINIMAL = 'Phòng tắm minimal trắng, bồn rửa gọn, khăn treo ngay ngắn',
  BATH_SPA = 'Phòng tắm spa tone be, nến trang trí, kệ khăn sạch',
  BATH_GLASS = 'Phòng tắm kính hiện đại, gạch xám nhạt, ánh sáng đều',
  BATH_LAVABO = 'Khu vực lavabo khách sạn, gương rộng, background sang',

  // HÀNH LANG
  HALL_APARTMENT = 'Hành lang căn hộ sạch, tường trắng, đèn downlight, gương treo tường',
  HALL_HOTEL = 'Hành lang khách sạn, thảm sạch, ánh đèn vàng, gương décor',
  HALL_ELEVATOR = 'Sảnh thang máy chung cư, inox sáng, gương lớn, nền gọn',
  HALL_ENTRANCE = 'Lối vào căn hộ, kệ giày gọn, gương đứng, ánh sáng ấm',
  HALL_WINDOW = 'Trước cửa sổ hành lang, nắng chiếu, nền tối giản',

  // STUDIO
  STUDIO_LIFESTYLE = 'Studio chụp ảnh lifestyle tại nhà, tường trắng trơn, ánh sáng cửa sổ',
  STUDIO_GRAY = 'Studio nền xám trơn, gương toàn thân, đèn softbox nhẹ (không lộ thiết bị)',
  STUDIO_CLEAN = 'Studio “clean background”, sàn gỗ, tường trắng, decor tối thiểu',
  STUDIO_EDITORIAL = 'Studio phong cách editorial, tường bê tông mịn, ánh sáng xiên',
  STUDIO_MONOCHROME = 'Studio concept monochrome, tường trơn một màu, ánh sáng mềm',

  // CAFE
  CAFE_MINIMAL = 'Quán cafe tối giản tone be, gương lớn cạnh tường, ánh sáng tự nhiên',
  CAFE_KOREAN = 'Quán cafe Hàn Quốc, tường trắng, bàn gỗ sáng, gương décor',
  CAFE_GARDEN = 'Quán cafe sân vườn, gương đặt cạnh cây xanh, nắng nhẹ',
  CAFE_ROOFTOP = 'Quán cafe rooftop, gương đứng, background trời xanh',
  CAFE_GALLERY = 'Quán cafe “gallery”, tường trắng treo tranh, gương lớn',

  // SHOWROOM
  SHOWROOM_FASHION = 'Showroom thời trang sạch sang, gương toàn thân, đèn trắng mềm',
  SHOWROOM_COSMETIC = 'Showroom mỹ phẩm, kệ trưng bày gọn, ánh sáng sang',
  SHOWROOM_NAIL = 'Studio nail/mi tidy, gương lớn, tường sáng, decor gọn',
  SHOWROOM_HAIR = 'Salon tóc cao cấp, gương soi lớn, ánh đèn vàng nhẹ',
  SHOWROOM_SPA = 'Spa/clinic thẩm mỹ sạch sẽ, tường trắng, ánh sáng đều',

  // VĂN PHÒNG
  OFFICE_LOBBY = 'Sảnh toà nhà văn phòng, nền đá sáng, gương décor, ánh đèn trần',
  OFFICE_LOUNGE = 'Khu lounge chung cư, sofa gọn, gương trang trí, ánh sáng ấm',
  OFFICE_LIBRARY = 'Thư viện/reading room yên tĩnh, kệ sách thẳng hàng, gương nhỏ',
  OFFICE_WORK = 'Phòng làm việc tối giản, bàn gọn, tường trơn, gương đứng',
  OFFICE_MEETING = 'Phòng họp nhỏ sang, kính, ánh sáng trung tính, gương trang trí',

  // GYM & MALL
  GYM_CLEAN = 'Phòng gym sạch sẽ, gương lớn, máy móc gọn, ánh sáng trắng',
  GYM_YOGA = 'Yoga studio, sàn gỗ, gương rộng, ánh sáng dịu',
  GYM_PILATES = 'Phòng tập pilates, tone sáng, gương dài, nội thất tối giản',
  MALL_HALLWAY = 'Hành lang trung tâm thương mại, gương décor, nền sáng sạch',
  MALL_FITTING = 'Khu vực thử đồ trong mall cao cấp, gương lớn, ánh sáng mềm',
}

export enum GeminiModel {
  FLASH_2_5 = 'gemini-2.5-flash-image',
  PRO_3_PREVIEW = 'gemini-3-pro-image-preview',
}

export interface GenerationState {
  isGenerating: boolean;
  progress: number;
  resultUrl?: string;
  error?: string;
}

export interface AppConfig {
  kocImage: string | null;
  outfitImage: string | null;
  scene: SceneChoice;
  additionalPrompt: string;
}

export interface ApiKeyConfig {
  keys: string[];
  activeKey: string | null;
  activeModel: string;
}
