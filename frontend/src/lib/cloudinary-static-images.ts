const cloudinaryBase = "https://res.cloudinary.com/dwddixz5b/image/upload";
const fastCategoryCardTransform = "f_auto,q_auto,w_900,h_1125,c_fill,g_auto";
const fastProductTransform = "f_auto,q_auto,w_520";

export const cloudinaryStaticImages = {
  heroSlides: {
    designer: `${cloudinaryBase}/f_auto,q_auto/WhatsApp_Image_2026-05-18_at_8.12.53_PM_uvpgob`,
    middleEastern: `${cloudinaryBase}/f_auto,q_auto/v1779181751/WhatsApp_Image_2026-05-18_at_8.12.53_PM_1_svujjj.jpg`,
    niche: `${cloudinaryBase}/f_auto,q_auto/v1779181805/WhatsApp_Image_2026-05-18_at_8.12.53_PM_3_gnxpy9.jpg`,
    signature: `${cloudinaryBase}/f_auto,q_auto/v1779181806/WhatsApp_Image_2026-05-18_at_8.12.53_PM_2_ag6p3k.jpg`,
  },
  categoryCards: {
    designer: `${cloudinaryBase}/${fastCategoryCardTransform}/v1779196736/WhatsApp_Image_2026-05-19_at_6.25.25_PM_ssz0lv.jpg`,
    middleEastern: `${cloudinaryBase}/${fastCategoryCardTransform}/v1779196021/purefumes-hyderabad/products%20MONGO_AUTO_INDEX%3Dtrue/middle-eastern/wlkvbg2ivd17ocudnc6s.webp`,
    niche: `${cloudinaryBase}/${fastCategoryCardTransform}/v1779196788/WhatsApp_Image_2026-05-19_at_6.22.58_PM_hbzy1l.jpg`,
  },
  products: {
    pourHomme: `${cloudinaryBase}/${fastProductTransform}/v1779181846/pour_homme_urbcyu.webp`,
    ninePm: `${cloudinaryBase}/${fastProductTransform}/v1779181847/9pm_ukaiv4.jpg`,
    kingdomMan: `${cloudinaryBase}/${fastProductTransform}/v1779181847/the_kingdom_man_xozmpr.jpg`,
  },
};
