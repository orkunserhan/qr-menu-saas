const fs = require('fs');

['en.json', 'tr.json'].forEach(file => {
  const path = `messages/${file}`;
  
  if (!fs.existsSync(path)) {
      console.log('Not found:', path);
      return;
  }
  
  let data;
  try {
      data = JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (e) {
      console.error('JSON Error in', file, e);
      return;
  }
  
  if (!data.admin.newRestaurant) {
      data.admin.newRestaurant = {};
  }
  
  const isEn = file === 'en.json';
  
  Object.assign(data.admin.newRestaurant, {
      title: isEn ? "Add New Restaurant" : "Yeni Restoran Ekle",
      description: isEn ? "Enter business details to create your menu." : "Menünüzü oluşturmak için işletme detaylarını girin.",
      businessInfo: isEn ? "Business Information" : "İşletme Bilgileri",
      restaurantName: isEn ? "Restaurant Name" : "Restoran Adı",
      restaurantNamePlaceholder: isEn ? "Ex: Blue Point" : "Örn: Ege Mavisi",
      businessType: isEn ? "Business Type" : "İşletme Türü",
      typeFineDining: isEn ? "Restaurant (Fine Dining)" : "Restoran (Fine Dining)",
      typeCasual: isEn ? "Fast Food / Casual" : "Fast Food / Casual",
      typeCafe: isEn ? "Cafe & Coffee Shop" : "Kafe & Coffee Shop",
      typeBakery: isEn ? "Bakery & Patisserie" : "Fırın & Pastane",
      typeBar: isEn ? "Bar & Pub" : "Bar & Pub",
      typeBeach: isEn ? "Beach & Hotel" : "Beach & Otel",
      typeOther: isEn ? "Other" : "Diğer",
      menuSettings: isEn ? "Menu Settings" : "Menü Ayarları",
      slug: isEn ? "URL Short Name (Slug)" : "URL Kısa Adı (Slug)",
      creating: isEn ? "Creating..." : "Oluşturuluyor...",
      createBtn: isEn ? "Create Restaurant" : "Restoranı Oluştur",
      unexpectedError: isEn ? "An unexpected error occurred." : "Beklenmeyen bir hata oluştu."
  });

  Object.assign(data.components, {
      productNamePlaceholder: isEn ? "Product Name (Ex: Kebab)" : "Ürün Adı (Örn: Adana Kebap)",
      price: isEn ? "Price (€)" : "Fiyat (€)",
      calories: isEn ? "Calories (kcal)" : "Kalori (kcal)",
      preparationTime: isEn ? "Prep Time (Min)" : "Hazırlama (Dk)",
      videoLink: isEn ? "Video Link (Youtube/Mp4)" : "Video Link (Youtube/Mp4)",
      productImage: isEn ? "Product Image" : "Ürün Görseli",
      descriptions: isEn ? "Descriptions" : "Açıklamalar / Descriptions",
      editProduct: isEn ? "Edit Product" : "Ürünü Düzenle",
      changeImage: isEn ? "Change Image (Optional)" : "Resmi Değiştir (İsteğe bağlı)",
      update: isEn ? "Update" : "Güncelle",
      staffEmpty: isEn ? "No staff members added." : "Henüz personel eklenmemiş."
  });

  data.landing.footerRights = isEn ? "All Rights Reserved." : "Tüm hakları saklıdır.";

  fs.writeFileSync(path, JSON.stringify(data, null, 4));
  console.log(`Updated ${file} successfully.`);
});
