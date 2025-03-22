// Shopping Cart functionality
let cart = [];

function addToCart(productName) {
    cart.push(productName);
    updateCartCount();
    showNotification(`${productName} đã được thêm vào giỏ hàng!`);
}

function updateCartCount() {
    const cartIcon = document.querySelector('.cart-icon');
    cartIcon.textContent = `🛒 Giỏ hàng (${cart.length})`;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Add styles dynamically
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#4ecdc4';
    notification.style.color = 'white';
    notification.style.padding = '1rem 2rem';
    notification.style.borderRadius = '5px';
    notification.style.animation = 'slideIn 0.5s ease-out';
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); }
        to { transform: translateX(100%); }
    }
`;
document.head.appendChild(style);

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '☰';
    mobileMenuBtn.style.display = 'none';
    
    const nav = document.querySelector('nav');
    nav.insertBefore(mobileMenuBtn, nav.firstChild);
    
    // Mobile menu styles
    const menuStyles = document.createElement('style');
    menuStyles.textContent = `
        @media (max-width: 768px) {
            .mobile-menu-btn {
                display: block !important;
                background: none;
                border: none;
                font-size: 1.5rem;
                color: var(--text-color);
                cursor: pointer;
            }
            
            .nav-links.active {
                display: flex !important;
                flex-direction: column;
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                padding: 1rem;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
        }
    `;
    document.head.appendChild(menuStyles);
    
    // Toggle mobile menu
    mobileMenuBtn.addEventListener('click', () => {
        const navLinks = document.querySelector('.nav-links');
        navLinks.classList.toggle('active');
    });
});

// Cart Management System
const cartManager = {
    addToCart: function(product) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Check if product already exists in cart
        const existingProduct = cart.find(p => p.id === product.id && p.weight === product.weight);
        
        if (existingProduct) {
            existingProduct.quantity = (existingProduct.quantity || 1) + 1;
        } else {
            product.quantity = 1;
            cart.push(product);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartCount();
        this.showNotification('Đã thêm vào giỏ hàng');
        
        // Update cart display if on cart page
        if (window.location.pathname.includes('cart.html')) {
            this.displayCart();
        }
    },

    buyNow: function(product) {
        localStorage.setItem('buyNowProduct', JSON.stringify(product));
        window.location.href = 'checkout.html';
    },

    updateCartCount: function() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
        }
    },

    removeFromCart: function(index) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartCount();
        this.displayCart();
    },

    updateQuantity: function(index, change) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const item = cart[index];
        
        item.quantity = (item.quantity || 1) + change;
        
        if (item.quantity < 1) {
            this.removeFromCart(index);
            return;
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartCount();
        this.displayCart();
    },

    displayCart: function() {
        const cartContent = document.getElementById('cartContent');
        const cartSummary = document.getElementById('cartSummary');
        const emptyCart = document.getElementById('emptyCart');
        
        if (!cartContent) return;
        
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (cart.length === 0) {
            cartContent.innerHTML = '';
            if (cartSummary) cartSummary.style.display = 'none';
            if (emptyCart) emptyCart.style.display = 'block';
            return;
        }
        
        if (emptyCart) emptyCart.style.display = 'none';
        if (cartSummary) cartSummary.style.display = 'block';
        
        let html = '<div class="cart-items">';
        let subtotal = 0;
        
        cart.forEach((item, index) => {
            const quantity = item.quantity || 1;
            const itemTotal = item.price * quantity;
            subtotal += itemTotal;
            
            html += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h3>${item.name}</h3>
                        <p>Weight: ${item.weight}</p>
                        <p>Price: ${item.price.toLocaleString()}đ</p>
                    </div>
                    <div class="quantity-controls">
                        <button onclick="cartManager.updateQuantity(${index}, -1)">-</button>
                        <span>${quantity}</span>
                        <button onclick="cartManager.updateQuantity(${index}, 1)">+</button>
                    </div>
                    <div class="item-price">${itemTotal.toLocaleString()}đ</div>
                    <button class="remove-item" onclick="cartManager.removeFromCart(${index})">×</button>
                </div>
            `;
        });
        
        html += '</div>';
        cartContent.innerHTML = html;
        
        // Update summary
        if (cartSummary) {
            const shipping = 30000;
            const total = subtotal + shipping;
            
            document.getElementById('subtotal').textContent = subtotal.toLocaleString() + 'đ';
            document.getElementById('total').textContent = total.toLocaleString() + 'đ';
        }
    },

    showNotification: function(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    },

    checkout: function() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            this.showNotification('Your cart is empty!');
            return;
        }
        window.location.href = 'checkout.html';
    }
};

// Initialize cart display and count when page loads
window.onload = function() {
    cartManager.updateCartCount();
    cartManager.displayCart();
};

// Vietnam Address Data
const vietnamAddressData = {
    "hanoi": {
        name: "Hà Nội",
        districts: {
            "badinh": { name: "Ba Đình" },
            "bacturliem": { name: "Bắc Từ Liêm" },
            "caugiay": { name: "Cầu Giấy" },
            "dongda": { name: "Đống Đa" },
            "hadong": { name: "Hà Đông" },
            "haibaTrung": { name: "Hai Bà Trưng" },
            "hoankiem": { name: "Hoàn Kiếm" },
            "hoangmai": { name: "Hoàng Mai" },
            "longbien": { name: "Long Biên" },
            "namturliem": { name: "Nam Từ Liêm" },
            "tayho": { name: "Tây Hồ" },
            "thanhxuan": { name: "Thanh Xuân" },
            "bavi": { name: "Ba Vì" },
            "chuongmy": { name: "Chương Mỹ" },
            "danphuong": { name: "Đan Phượng" },
            "donganh": { name: "Đông Anh" },
            "gialam": { name: "Gia Lâm" },
            "hoaiduc": { name: "Hoài Đức" },
            "melinh": { name: "Mê Linh" },
            "myduc": { name: "Mỹ Đức" },
            "phuctho": { name: "Phúc Thọ" },
            "quocoai": { name: "Quốc Oai" },
            "socson": { name: "Sóc Sơn" },
            "thachthat": { name: "Thạch Thất" },
            "thanhoai": { name: "Thanh Oai" },
            "thanhtri": { name: "Thanh Trì" },
            "thuongtin": { name: "Thường Tín" },
            "unghoa": { name: "Ứng Hòa" }
        }
    },
    "hochiminh": {
        name: "Hồ Chí Minh",
        districts: {
            "district1": { name: "Quận 1" },
            "district2": { name: "Quận 2" },
            "district3": { name: "Quận 3" },
            "district4": { name: "Quận 4" },
            "district5": { name: "Quận 5" },
            "district6": { name: "Quận 6" },
            "district7": { name: "Quận 7" },
            "district8": { name: "Quận 8" },
            "district9": { name: "Quận 9" },
            "district10": { name: "Quận 10" },
            "district11": { name: "Quận 11" },
            "district12": { name: "Quận 12" },
            "binhthanh": { name: "Bình Thạnh" },
            "govap": { name: "Gò Vấp" },
            "phunhuan": { name: "Phú Nhuận" },
            "tanbinh": { name: "Tân Bình" },
            "tanphu": { name: "Tân Phú" },
            "thuduc": { name: "Thủ Đức" },
            "binhtan": { name: "Bình Tân" },
            "cangio": { name: "Cần Giờ" },
            "cuchi": { name: "Củ Chi" },
            "hocmon": { name: "Hóc Môn" },
            "binhchanh": { name: "Bình Chánh" },
            "nhabe": { name: "Nhà Bè" }
        }
    },
    "hagiang": {
        name: "Hà Giang",
        districts: {
            "hagiangcity": { name: "Hà Giang City" },
            "bacme": { name: "Bắc Mê" },
            "bacquang": { name: "Bắc Quang" },
            "dongvan": { name: "Đồng Văn" },
            "hoangxuphi": { name: "Hoàng Su Phì" },
            "meovac": { name: "Mèo Vạc" },
            "quanba": { name: "Quản Bạ" },
            "quangbinh": { name: "Quang Bình" },
            "vixuyen": { name: "Vị Xuyên" },
            "xinman": { name: "Xín Mần" },
            "yenminh": { name: "Yên Minh" }
        }
    },
    "caobang": {
        name: "Cao Bằng",
        districts: {
            "caobangcity": { name: "Cao Bằng City" },
            "baolac": { name: "Bảo Lạc" },
            "baolam": { name: "Bảo Lâm" },
            "halang": { name: "Hạ Lang" },
            "haquang": { name: "Hà Quảng" },
            "hoaan": { name: "Hòa An" },
            "nguyenbinh": { name: "Nguyên Bình" },
            "phuchoa": { name: "Phục Hòa" },
            "quanghoa": { name: "Quảng Hòa" },
            "thachan": { name: "Thạch An" },
            "trungkhanh": { name: "Trùng Khánh" }
        }
    },
    "laocai": {
        name: "Lào Cai",
        districts: {
            "laocaicity": { name: "Lào Cai City" },
            "bacha": { name: "Bắc Hà" },
            "baothang": { name: "Bảo Thắng" },
            "baoyen": { name: "Bảo Yên" },
            "batxat": { name: "Bát Xát" },
            "muongkhuong": { name: "Mường Khương" },
            "simacai": { name: "Si Ma Cai" },
            "vanban": { name: "Văn Bàn" }
        }
    },
    "bacgiang": {
        name: "Bắc Giang",
        districts: {
            "bacgiangcity": { name: "Bắc Giang City" },
            "hiephoa": { name: "Hiệp Hòa" },
            "langgiang": { name: "Lạng Giang" },
            "lucnam": { name: "Lục Nam" },
            "lucngan": { name: "Lục Ngạn" },
            "sondong": { name: "Sơn Động" },
            "tanyen": { name: "Tân Yên" },
            "vietyen": { name: "Việt Yên" },
            "yendung": { name: "Yên Dũng" },
            "yenthe": { name: "Yên Thế" }
        }
    },
    "backan": {
        name: "Bắc Kạn",
        districts: {
            "backancity": { name: "Bắc Kạn City" },
            "babe": { name: "Ba Bể" },
            "bachthong": { name: "Bạch Thông" },
            "chodon": { name: "Chợ Đồn" },
            "chomoi": { name: "Chợ Mới" },
            "nari": { name: "Na Rì" },
            "nganson": { name: "Ngân Sơn" },
            "pacnam": { name: "Pác Nặm" }
        }
    },
    "langson": {
        name: "Lạng Sơn",
        districts: {
            "langsoncity": { name: "Lạng Sơn City" },
            "bacson": { name: "Bắc Sơn" },
            "binhgia": { name: "Bình Gia" },
            "caoloc": { name: "Cao Lộc" },
            "chilang": { name: "Chi Lăng" },
            "dinhlap": { name: "Đình Lập" },
            "huulung": { name: "Hữu Lũng" },
            "locbinh": { name: "Lộc Bình" },
            "trangdinh": { name: "Tràng Định" },
            "vanlang": { name: "Văn Lãng" },
            "vanquan": { name: "Văn Quan" }
        }
    },
    "phutho": {
        name: "Phú Thọ",
        districts: {
            "viettri": { name: "Việt Trì City" },
            "phuthotown": { name: "Phú Thọ Town" },
            "camkhe": { name: "Cẩm Khê" },
            "doanhung": { name: "Đoan Hùng" },
            "hahoa": { name: "Hạ Hòa" },
            "lamthao": { name: "Lâm Thao" },
            "tamnong": { name: "Tam Nông" },
            "tanson": { name: "Tân Sơn" },
            "thanhba": { name: "Thanh Ba" },
            "thanhson": { name: "Thanh Sơn" },
            "thanhthuy": { name: "Thanh Thủy" },
            "yenlap": { name: "Yên Lập" }
        }
    },
    "quangninh": {
        name: "Quảng Ninh",
        districts: {
            "halong": { name: "Hạ Long City" },
            "campha": { name: "Cẩm Phả City" },
            "mongcai": { name: "Móng Cái City" },
            "uongbi": { name: "Uông Bí City" },
            "binhlieu": { name: "Bình Liêu" },
            "bache": { name: "Ba Chẽ" },
            "coto": { name: "Cô Tô" },
            "damha": { name: "Đầm Hà" },
            "dongtrien": { name: "Đông Triều" },
            "haiha": { name: "Hải Hà" },
            "hoanhbo": { name: "Hoành Bồ" },
            "quangyen": { name: "Quảng Yên" },
            "tienyen": { name: "Tiên Yên" },
            "vandon": { name: "Vân Đồn" }
        }
    },
    "sonla": {
        name: "Sơn La",
        districts: {
            "sonlacity": { name: "Sơn La City" },
            "bacyen": { name: "Bắc Yên" },
            "maison": { name: "Mai Sơn" },
            "mocchau": { name: "Mộc Châu" },
            "muongla": { name: "Mường La" },
            "phuyen": { name: "Phù Yên" },
            "quynhnhai": { name: "Quỳnh Nhai" },
            "songma": { name: "Sông Mã" },
            "sopcop": { name: "Sốp Cộp" },
            "thuanchau": { name: "Thuận Châu" },
            "vanho": { name: "Vân Hồ" },
            "yenchau": { name: "Yên Châu" }
        }
    },
    "thainguyen": {
        name: "Thái Nguyên",
        districts: {
            "thainguyencity": { name: "Thái Nguyên City" },
            "songcong": { name: "Sông Công City" },
            "daitu": { name: "Đại Từ" },
            "dinhhoa": { name: "Định Hóa" },
            "donghy": { name: "Đồng Hỷ" },
            "phoyen": { name: "Phổ Yên" },
            "phubinh": { name: "Phú Bình" },
            "phuluong": { name: "Phú Lương" },
            "vonhai": { name: "Võ Nhai" }
        }
    },
    "tuyenquang": {
        name: "Tuyên Quang",
        districts: {
            "tuyenquangcity": { name: "Tuyên Quang City" },
            "chiemhoa": { name: "Chiêm Hóa" },
            "hamyen": { name: "Hàm Yên" },
            "lambinh": { name: "Lâm Bình" },
            "nahang": { name: "Na Hang" },
            "sonduong": { name: "Sơn Dương" },
            "yenson": { name: "Yên Sơn" }
        }
    },
    "yenbai": {
        name: "Yên Bái",
        districts: {
            "yenbaicity": { name: "Yên Bái City" },
            "nghialo": { name: "Nghĩa Lộ Town" },
            "lucyen": { name: "Lục Yên" },
            "mucangchai": { name: "Mù Cang Chải" },
            "tramtau": { name: "Trạm Tấu" },
            "tranyen": { name: "Trấn Yên" },
            "vanchan": { name: "Văn Chấn" },
            "vanyen": { name: "Văn Yên" },
            "yenbinh": { name: "Yên Bình" }
        }
    },
    "dienbien": {
        name: "Điện Biên",
        districts: {
            "dienbienphu": { name: "Điện Biên Phủ City" },
            "muonglay": { name: "Mường Lay Town" },
            "dienbien": { name: "Điện Biên" },
            "dienbiendong": { name: "Điện Biên Đông" },
            "muongang": { name: "Mường Ảng" },
            "muongcha": { name: "Mường Chà" },
            "muongnhe": { name: "Mường Nhé" },
            "nampo": { name: "Nậm Pồ" },
            "tuachua": { name: "Tủa Chùa" },
            "tuangiao": { name: "Tuần Giáo" }
        }
    },
    "hoabinh": {
        name: "Hòa Bình",
        districts: {
            "hoabinhcity": { name: "Hòa Bình City" },
            "caophong": { name: "Cao Phong" },
            "dabac": { name: "Đà Bắc" },
            "kimboi": { name: "Kim Bôi" },
            "lacson": { name: "Lạc Sơn" },
            "lacthuy": { name: "Lạc Thủy" },
            "luongson": { name: "Lương Sơn" },
            "maichau": { name: "Mai Châu" },
            "tanlac": { name: "Tân Lạc" },
            "yenthuy": { name: "Yên Thủy" }
        }
    },
    "laichau": {
        name: "Lai Châu",
        districts: {
            "laichaucity": { name: "Lai Châu City" },
            "muongte": { name: "Mường Tè" },
            "namnhun": { name: "Nậm Nhùn" },
            "phongto": { name: "Phong Thổ" },
            "sinho": { name: "Sìn Hồ" },
            "tanuyen": { name: "Tân Uyên" },
            "tamduong": { name: "Tam Đường" },
            "thanuyen": { name: "Than Uyên" }
        }
    },
    "hatinh": {
        name: "Hà Tĩnh",
        districts: {
            "hatinhcity": { name: "Hà Tĩnh City" },
            "honglinh": { name: "Hồng Lĩnh Town" },
            "camxuyen": { name: "Cẩm Xuyên" },
            "canloc": { name: "Can Lộc" },
            "ductho": { name: "Đức Thọ" },
            "huongkhe": { name: "Hương Khê" },
            "huongson": { name: "Hương Sơn" },
            "kyanh": { name: "Kỳ Anh" },
            "locha": { name: "Lộc Hà" },
            "nghixuan": { name: "Nghi Xuân" },
            "thachha": { name: "Thạch Hà" },
            "vuquang": { name: "Vũ Quang" }
        }
    },
    "nghean": {
        name: "Nghệ An",
        districts: {
            "vinhcity": { name: "Vinh City" },
            "cualo": { name: "Cửa Lò Town" },
            "thaihoa": { name: "Thái Hòa Town" },
            "anhson": { name: "Anh Sơn" },
            "concuong": { name: "Con Cuông" },
            "dienchau": { name: "Diễn Châu" },
            "doluong": { name: "Đô Lương" },
            "hungnguen": { name: "Hưng Nguyên" },
            "kyson": { name: "Kỳ Sơn" },
            "namdan": { name: "Nam Đàn" },
            "nghiloc": { name: "Nghi Lộc" },
            "nghiadan": { name: "Nghĩa Đàn" },
            "quephong": { name: "Quế Phong" },
            "quychau": { name: "Quỳ Châu" },
            "quyhop": { name: "Quỳ Hợp" },
            "quynhluu": { name: "Quỳnh Lưu" },
            "tanky": { name: "Tân Kỳ" },
            "thanhchuong": { name: "Thanh Chương" },
            "tuongduong": { name: "Tương Dương" },
            "yenthanh": { name: "Yên Thành" }
        }
    },
    "quangbinh": {
        name: "Quảng Bình",
        districts: {
            "donghoicity": { name: "Đồng Hới City" },
            "badon": { name: "Ba Đồn Town" },
            "botrach": { name: "Bố Trạch" },
            "lethuy": { name: "Lệ Thủy" },
            "minhhoa": { name: "Minh Hóa" },
            "quangninh": { name: "Quảng Ninh" },
            "quangtrach": { name: "Quảng Trạch" },
            "tuyenhoa": { name: "Tuyên Hóa" }
        }
    },
    "quangtri": {
        name: "Quảng Trị",
        districts: {
            "dongha": { name: "Đông Hà City" },
            "quangtritown": { name: "Quảng Trị Town" },
            "camlo": { name: "Cam Lộ" },
            "conco": { name: "Cồn Cỏ" },
            "dakrong": { name: "Đa Krông" },
            "giolinh": { name: "Gio Linh" },
            "hailang": { name: "Hải Lăng" },
            "huonghoa": { name: "Hướng Hóa" },
            "trieuphong": { name: "Triệu Phong" },
            "vinhlinh": { name: "Vĩnh Linh" }
        }
    },
    "thanhhoa": {
        name: "Thanh Hóa",
        districts: {
            "thanhhoacity": { name: "Thanh Hóa City" },
            "bimson": { name: "Bỉm Sơn Town" },
            "samson": { name: "Sầm Sơn City" },
            "bathuoc": { name: "Bá Thước" },
            "camthuy": { name: "Cẩm Thủy" },
            "dongson": { name: "Đông Sơn" },
            "hatrung": { name: "Hà Trung" },
            "hauloc": { name: "Hậu Lộc" },
            "hoanghoa": { name: "Hoằng Hóa" },
            "langchanh": { name: "Lang Chánh" },
            "muonglat": { name: "Mường Lát" },
            "ngason": { name: "Nga Sơn" },
            "ngoclac": { name: "Ngọc Lặc" },
            "nhuthanh": { name: "Như Thanh" },
            "nhuxuan": { name: "Như Xuân" },
            "nongcong": { name: "Nông Cống" },
            "quanhoa": { name: "Quan Hóa" },
            "quanson": { name: "Quan Sơn" },
            "quangxuong": { name: "Quảng Xương" },
            "thachthanh": { name: "Thạch Thành" },
            "thieuhoa": { name: "Thiệu Hóa" },
            "thoxuan": { name: "Thọ Xuân" },
            "thuongxuan": { name: "Thường Xuân" },
            "trieuson": { name: "Triệu Sơn" },
            "vinhloc": { name: "Vĩnh Lộc" },
            "yendinh": { name: "Yên Định" }
        }
    },
    "thuathienhue": {
        name: "Thừa Thiên Huế",
        districts: {
            "huecity": { name: "Huế City" },
            "aluoi": { name: "A Lưới" },
            "huongtra": { name: "Hương Trà Town" },
            "huongthuy": { name: "Hương Thủy Town" },
            "namdong": { name: "Nam Đông" },
            "phongdien": { name: "Phong Điền" },
            "phuloc": { name: "Phú Lộc" },
            "phuvang": { name: "Phú Vang" },
            "quangdien": { name: "Quảng Điền" }
        }
    },
    "binhdinh": {
        name: "Bình Định",
        districts: {
            "quynhon": { name: "Quy Nhơn City" },
            "annhon": { name: "An Nhơn Town" },
            "anlao": { name: "An Lão" },
            "hoaian": { name: "Hoài Ân" },
            "hoainhon": { name: "Hoài Nhơn" },
            "phucat": { name: "Phù Cát" },
            "phumy": { name: "Phù Mỹ" },
            "tayson": { name: "Tây Sơn" },
            "tuyphuoc": { name: "Tuy Phước" },
            "vancanh": { name: "Vân Canh" },
            "vinhthach": { name: "Vĩnh Thạnh" }
        }
    },
    "binhthuan": {
        name: "Bình Thuận",
        districts: {
            "phanthiet": { name: "Phan Thiết City" },
            "lagi": { name: "La Gi Town" },
            "bacbinh": { name: "Bắc Bình" },
            "duclinh": { name: "Đức Linh" },
            "hamtan": { name: "Hàm Tân" },
            "hamthuanbac": { name: "Hàm Thuận Bắc" },
            "hamthuannam": { name: "Hàm Thuận Nam" },
            "phuquy": { name: "Phú Quý" },
            "tanhlinh": { name: "Tánh Linh" },
            "tuyphong": { name: "Tuy Phong" }
        }
    },
    "daklak": {
        name: "Đắk Lắk",
        districts: {
            "buonmathuot": { name: "Buôn Ma Thuột City" },
            "buondon": { name: "Buôn Đôn" },
            "cukuin": { name: "Cư Kuin" },
            "cumgar": { name: "Cư M'gar" },
            "eahleo": { name: "Ea H'leo" },
            "eakar": { name: "Ea Kar" },
            "easup": { name: "Ea Súp" },
            "krongana": { name: "Krông Ana" },
            "krongbong": { name: "Krông Bông" },
            "krongbuk": { name: "Krông Búk" },
            "krongnang": { name: "Krông Năng" },
            "krongpac": { name: "Krông Pắc" },
            "lak": { name: "Lắk" },
            "mdrak": { name: "M'Đrắk" }
        }
    },
    "daknong": {
        name: "Đắk Nông",
        districts: {
            "gianghia": { name: "Gia Nghĩa City" },
            "cujut": { name: "Cư Jút" },
            "dakglong": { name: "Đắk G'Long" },
            "dakmil": { name: "Đắk Mil" },
            "dakrlap": { name: "Đắk R'Lấp" },
            "daksong": { name: "Đắk Song" },
            "krongno": { name: "Krông Nô" },
            "tuyduc": { name: "Tuy Đức" }
        }
    },
    "gialai": {
        name: "Gia Lai",
        districts: {
            "pleiku": { name: "Pleiku City" },
            "ankhe": { name: "An Khê Town" },
            "ayunpa": { name: "Ayun Pa Town" },
            "chupah": { name: "Chư Păh" },
            "chuprong": { name: "Chư Prông" },
            "chupuh": { name: "Chư Pưh" },
            "chuse": { name: "Chư Sê" },
            "dakdoa": { name: "Đắk Đoa" },
            "dakpo": { name: "Đắk Pơ" },
            "iagrai": { name: "Ia Grai" },
            "iapa": { name: "Ia Pa" },
            "kbang": { name: "K'Bang" },
            "kongchro": { name: "Kông Chro" },
            "mangyang": { name: "Mang Yang" },
            "phuthien": { name: "Phú Thiện" }
        }
    },
    "khanhhoa": {
        name: "Khánh Hòa",
        districts: {
            "nhatrang": { name: "Nha Trang City" },
            "camranh": { name: "Cam Ranh City" },
            "camlam": { name: "Cam Lâm" },
            "dienkhanh": { name: "Diên Khánh" },
            "khanhson": { name: "Khánh Sơn" },
            "khanhvinh": { name: "Khánh Vĩnh" },
            "ninhhoa": { name: "Ninh Hòa Town" },
            "truongsa": { name: "Trường Sa" },
            "vanninh": { name: "Vạn Ninh" }
        }
    },
    "kontum": {
        name: "Kon Tum",
        districts: {
            "kontumcity": { name: "Kon Tum City" },
            "dakglei": { name: "Đắk Glei" },
            "dakha": { name: "Đắk Hà" },
            "dakto": { name: "Đắk Tô" },
            "iahdrai": { name: "Ia H'Drai" },
            "konplong": { name: "Kon Plông" },
            "konray": { name: "Kon Rẫy" },
            "ngochoi": { name: "Ngọc Hồi" },
            "sathay": { name: "Sa Thầy" },
            "tumorong": { name: "Tu Mơ Rông" }
        }
    },
    "lamdong": {
        name: "Lâm Đồng",
        districts: {
            "dalat": { name: "Đà Lạt City" },
            "baoloc": { name: "Bảo Lộc City" },
            "baolam": { name: "Bảo Lâm" },
            "cattien": { name: "Cát Tiên" },
            "dahoai": { name: "Đạ Huoai" },
            "dateh": { name: "Đạ Tẻh" },
            "damrong": { name: "Đam Rông" },
            "dilinh": { name: "Di Linh" },
            "donduong": { name: "Đơn Dương" },
            "ductrong": { name: "Đức Trọng" },
            "lacduong": { name: "Lạc Dương" },
            "lamha": { name: "Lâm Hà" }
        }
    },
    "ninhthuan": {
        name: "Ninh Thuận",
        districts: {
            "phanrang": { name: "Phan Rang-Tháp Chàm City" },
            "bacai": { name: "Bác Ái" },
            "ninhhai": { name: "Ninh Hải" },
            "ninhphuoc": { name: "Ninh Phước" },
            "ninhson": { name: "Ninh Sơn" },
            "thuanbac": { name: "Thuận Bắc" },
            "thuannam": { name: "Thuận Nam" }
        }
    },
    "phuyen": {
        name: "Phú Yên",
        districts: {
            "tuyhoa": { name: "Tuy Hòa City" },
            "donghoa": { name: "Đông Hòa Town" },
            "dongxuan": { name: "Đồng Xuân" },
            "phuhoa": { name: "Phú Hòa" },
            "sonhoa": { name: "Sơn Hòa" },
            "songcau": { name: "Sông Cầu Town" },
            "songhinh": { name: "Sông Hinh" },
            "tayhoa": { name: "Tây Hòa" },
            "tuyan": { name: "Tuy An" }
        }
    },
    "quangnam": {
        name: "Quảng Nam",
        districts: {
            "tamky": { name: "Tam Kỳ City" },
            "hoian": { name: "Hội An City" },
            "bactramy": { name: "Bắc Trà My" },
            "dailoc": { name: "Đại Lộc" },
            "donggiang": { name: "Đông Giang" },
            "duyxuyen": { name: "Duy Xuyên" },
            "hiepduc": { name: "Hiệp Đức" },
            "namgiang": { name: "Nam Giang" },
            "namtramy": { name: "Nam Trà My" },
            "nuithach": { name: "Núi Thành" },
            "phuninh": { name: "Phú Ninh" },
            "phuocson": { name: "Phước Sơn" },
            "queson": { name: "Quế Sơn" },
            "taygiang": { name: "Tây Giang" },
            "thangbinh": { name: "Thăng Bình" },
            "tienphuc": { name: "Tiên Phước" }
        }
    },
    "angiang": {
        name: "An Giang",
        districts: {
            "longxuyen": { name: "Long Xuyên City" },
            "chaudoc": { name: "Châu Đốc City" },
            "anphu": { name: "An Phú" },
            "chauphu": { name: "Châu Phú" },
            "chauthanh": { name: "Châu Thành" },
            "chomoi": { name: "Chợ Mới" },
            "phutan": { name: "Phú Tân" },
            "thoaison": { name: "Thoại Sơn" },
            "tinhbien": { name: "Tịnh Biên" },
            "triton": { name: "Tri Tôn" }
        }
    },
    "bariavungtau": {
        name: "Bà Rịa - Vũng Tàu",
        districts: {
            "vungtau": { name: "Vũng Tàu City" },
            "baria": { name: "Bà Rịa City" },
            "chauduc": { name: "Châu Đức" },
            "condao": { name: "Côn Đảo" },
            "datdo": { name: "Đất Đỏ" },
            "longdien": { name: "Long Điền" },
            "tanthanh": { name: "Tân Thành" },
            "xuyenmoc": { name: "Xuyên Mộc" }
        }
    },
    "baclieu": {
        name: "Bạc Liêu",
        districts: {
            "baclieucity": { name: "Bạc Liêu City" },
            "donghai": { name: "Đông Hải" },
            "giarai": { name: "Giá Rai Town" },
            "hoabinh": { name: "Hòa Bình" },
            "hongdan": { name: "Hồng Dân" },
            "phuoclong": { name: "Phước Long" },
            "vinhloi": { name: "Vĩnh Lợi" }
        }
    },
    "bentre": {
        name: "Bến Tre",
        districts: {
            "bentrecity": { name: "Bến Tre City" },
            "batri": { name: "Ba Tri" },
            "binhdai": { name: "Bình Đại" },
            "chauthanh": { name: "Châu Thành" },
            "cholach": { name: "Chợ Lách" },
            "giongtrom": { name: "Giồng Trôm" },
            "mocaybac": { name: "Mỏ Cày Bắc" },
            "mocaynam": { name: "Mỏ Cày Nam" },
            "thanhphu": { name: "Thạnh Phú" }
        }
    },
    "binhduong": {
        name: "Bình Dương",
        districts: {
            "thudaumot": { name: "Thủ Dầu Một City" },
            "dian": { name: "Dĩ An City" },
            "thuanan": { name: "Thuận An City" },
            "baubang": { name: "Bàu Bàng" },
            "bactanuyen": { name: "Bắc Tân Uyên" },
            "dautieng": { name: "Dầu Tiếng" },
            "phugiao": { name: "Phú Giáo" },
            "tanuyen": { name: "Tân Uyên" },
            "bencat": { name: "Bến Cát" }
        }
    },
    "binhphuoc": {
        name: "Bình Phước",
        districts: {
            "dongxoai": { name: "Đồng Xoài Town" },
            "binhlong": { name: "Bình Long Town" },
            "phuoclong": { name: "Phước Long Town" },
            "budang": { name: "Bù Đăng" },
            "budop": { name: "Bù Đốp" },
            "bugiamp": { name: "Bù Gia Mập" },
            "chonthanh": { name: "Chơn Thành" },
            "dongphu": { name: "Đồng Phú" },
            "honquan": { name: "Hớn Quản" },
            "locninh": { name: "Lộc Ninh" }
        }
    },
    "camau": {
        name: "Cà Mau",
        districts: {
            "camauctiy": { name: "Cà Mau City" },
            "cainuoc": { name: "Cái Nước" },
            "damdoi": { name: "Đầm Dơi" },
            "namcan": { name: "Năm Căn" },
            "ngochien": { name: "Ngọc Hiển" },
            "phutan": { name: "Phú Tân" },
            "thoibinh": { name: "Thới Bình" },
            "tranvanthoi": { name: "Trần Văn Thời" },
            "uminh": { name: "U Minh" }
        }
    },
    "cantho": {
        name: "Cần Thơ",
        districts: {
            "ninhkieu": { name: "Ninh Kiều" },
            "binhthuy": { name: "Bình Thủy" },
            "cairang": { name: "Cái Răng" },
            "omon": { name: "Ô Môn" },
            "thotnot": { name: "Thốt Nốt" },
            "codo": { name: "Cờ Đỏ" },
            "phongdien": { name: "Phong Điền" },
            "thoilai": { name: "Thới Lai" },
            "vinhthanh": { name: "Vĩnh Thạnh" }
        }
    },
    "dongnai": {
        name: "Đồng Nai",
        districts: {
            "bienhoa": { name: "Biên Hòa City" },
            "longkhanh": { name: "Long Khánh City" },
            "cammy": { name: "Cẩm Mỹ" },
            "dinhquan": { name: "Định Quán" },
            "longthanh": { name: "Long Thành" },
            "nhontrach": { name: "Nhơn Trạch" },
            "tanphu": { name: "Tân Phú" },
            "thongnhat": { name: "Thống Nhất" },
            "trangbom": { name: "Trảng Bom" },
            "vinhcuu": { name: "Vĩnh Cửu" }
        }
    },
    "dongthap": {
        name: "Đồng Tháp",
        districts: {
            "caolanh": { name: "Cao Lãnh City" },
            "sadec": { name: "Sa Đéc City" },
            "hongngut": { name: "Hồng Ngự Town" },
            "caolanh_district": { name: "Cao Lãnh" },
            "chauthanh": { name: "Châu Thành" },
            "hongngu": { name: "Hồng Ngự" },
            "laivung": { name: "Lai Vung" },
            "lapvo": { name: "Lấp Vò" },
            "tamnong": { name: "Tam Nông" },
            "tanhong": { name: "Tân Hồng" },
            "thanhbinh": { name: "Thanh Bình" },
            "thapmuoi": { name: "Tháp Mười" }
        }
    },
    "haugiang": {
        name: "Hậu Giang",
        districts: {
            "vithanh": { name: "Vị Thanh City" },
            "ngabay": { name: "Ngã Bảy Town" },
            "chauthanh": { name: "Châu Thành" },
            "chauthanh_a": { name: "Châu Thành A" },
            "longmy": { name: "Long Mỹ" },
            "phunghiep": { name: "Phụng Hiệp" },
            "vithuy": { name: "Vị Thủy" }
        }
    },
    "kiengiang": {
        name: "Kiên Giang",
        districts: {
            "rachgia": { name: "Rạch Giá City" },
            "hatien": { name: "Hà Tiên Town" },
            "anbien": { name: "An Biên" },
            "anminh": { name: "An Minh" },
            "chauthanh": { name: "Châu Thành" },
            "giangthanh": { name: "Giang Thành" },
            "giongrieng": { name: "Giồng Riềng" },
            "goquao": { name: "Gò Quao" },
            "hondat": { name: "Hòn Đất" },
            "kienhai": { name: "Kiên Hải" },
            "kienluong": { name: "Kiên Lương" },
            "phuquoc": { name: "Phú Quốc" },
            "tanhiep": { name: "Tân Hiệp" },
            "uminhth": { name: "U Minh Thượng" },
            "vinhthuankg": { name: "Vĩnh Thuận" }
        }
    },
    "longan": {
        name: "Long An",
        districts: {
            "tanan": { name: "Tân An City" },
            "benluc": { name: "Bến Lức" },
            "canduoc": { name: "Cần Đước" },
            "cangiuoc": { name: "Cần Giuộc" },
            "chauthanh": { name: "Châu Thành" },
            "duchoa": { name: "Đức Hòa" },
            "duchue": { name: "Đức Huệ" },
            "mochoa": { name: "Mộc Hóa" },
            "tanhung": { name: "Tân Hưng" },
            "tanthanh": { name: "Tân Thạnh" },
            "tantru": { name: "Tân Trụ" },
            "thanhhoa": { name: "Thạnh Hóa" },
            "thuthua": { name: "Thủ Thừa" },
            "vinhhung": { name: "Vĩnh Hưng" }
        }
    },
    "soctrang": {
        name: "Sóc Trăng",
        districts: {
            "soctrangcity": { name: "Sóc Trăng City" },
            "chauthanh": { name: "Châu Thành" },
            "culaodung": { name: "Cù Lao Dung" },
            "kesach": { name: "Kế Sách" },
            "longphu": { name: "Long Phú" },
            "mytu": { name: "Mỹ Tú" },
            "myxuyen": { name: "Mỹ Xuyên" },
            "nganam": { name: "Ngã Năm" },
            "thanhtri": { name: "Thạnh Trị" },
            "trande": { name: "Trần Đề" },
            "vinhchau": { name: "Vĩnh Châu" }
        }
    },
    "tayninh": {
        name: "Tây Ninh",
        districts: {
            "tayninhcity": { name: "Tây Ninh City" },
            "bencau": { name: "Bến Cầu" },
            "chauthanh": { name: "Châu Thành" },
            "duongminhchau": { name: "Dương Minh Châu" },
            "godau": { name: "Gò Dầu" },
            "hoathanh": { name: "Hòa Thành" },
            "tanbien": { name: "Tân Biên" },
            "tanchau": { name: "Tân Châu" },
            "trangbang": { name: "Trảng Bàng" }
        }
    },
    "tiengiang": {
        name: "Tiền Giang",
        districts: {
            "mytho": { name: "Mỹ Tho City" },
            "cailay": { name: "Cai Lậy Town" },
            "caibe": { name: "Cái Bè" },
            "chauthanh": { name: "Châu Thành" },
            "gocong": { name: "Gò Công" },
            "gocongdong": { name: "Gò Công Đông" },
            "gocongtay": { name: "Gò Công Tây" },
            "tanphudong": { name: "Tân Phú Đông" },
            "tanphuoc": { name: "Tân Phước" }
        }
    },
    "vinhlong": {
        name: "Vĩnh Long",
        districts: {
            "vinhlongcity": { name: "Vĩnh Long City" },
            "binhminh": { name: "Bình Minh Town" },
            "binhtan": { name: "Bình Tân" },
            "longho": { name: "Long Hồ" },
            "mangthit": { name: "Mang Thít" },
            "tambinh": { name: "Tam Bình" },
            "traon": { name: "Trà Ôn" },
            "vungliem": { name: "Vũng Liêm" }
        }
    }
};

// Address Field Population Functions
function populateDistricts() {
    const provinceSelect = document.getElementById('province');
    const districtSelect = document.getElementById('district');
    const wardSelect = document.getElementById('ward');
    
    // Clear existing options
    districtSelect.innerHTML = '<option value="">Chọn Quận/Huyện</option>';
    wardSelect.innerHTML = '<option value="">Chọn Phường/Xã</option>';
    
    const selectedProvince = provinceSelect.value;
    if (selectedProvince && vietnamAddressData[selectedProvince]) {
        const districts = vietnamAddressData[selectedProvince].districts;
        Object.keys(districts).forEach(districtKey => {
            const option = document.createElement('option');
            option.value = districtKey;
            option.textContent = districts[districtKey].name;
            districtSelect.appendChild(option);
        });
    }
}

function populateWards() {
    const provinceSelect = document.getElementById('province');
    const districtSelect = document.getElementById('district');
    const wardSelect = document.getElementById('ward');
    
    // Clear existing options
    wardSelect.innerHTML = '<option value="">Chọn Phường/Xã</option>';
    
    const selectedProvince = provinceSelect.value;
    const selectedDistrict = districtSelect.value;
    
    if (selectedProvince && selectedDistrict && 
        vietnamAddressData[selectedProvince] && 
        vietnamAddressData[selectedProvince].districts[selectedDistrict]) {
        
        const wards = vietnamAddressData[selectedProvince].districts[selectedDistrict].wards;
        wards.forEach(ward => {
            const option = document.createElement('option');
            option.value = ward;
            option.textContent = ward;
            wardSelect.appendChild(option);
        });
    }
}

// Initialize address fields when page loads
document.addEventListener('DOMContentLoaded', function() {
    const provinceSelect = document.getElementById('province');
    const districtSelect = document.getElementById('district');
    
    if (provinceSelect && districtSelect) {
        // Add event listeners
        provinceSelect.addEventListener('change', populateDistricts);
        districtSelect.addEventListener('change', populateWards);
    }
}); 