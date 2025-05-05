import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-white to-gray-50 border-t border-gray-200 pt-12 pb-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Column 1: Address Information */}
          <div className="space-y-4">
            <h2 className="font-bold text-lg text-gray-800 border-b border-orange-300 pb-2 mb-4">
              CHI NHÁNH
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-orange-600 mb-1">HÀ NỘI</h3>
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-gray-600">
                    Số 3 Hoàng Dương Thanh Ba Phú Thọ<br />
                    <span className="font-medium">Sđt: 0123654789</span>
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-orange-600 mb-1">HỒ CHÍ MINH</h3>
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-gray-600">
                    66B Nguyễn Sỹ Sách phường 15 quận Tân Bình<br />
                    <span className="font-medium">Sđt: 0123654789</span>
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-orange-600 mb-1">EMAIL</h3>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <a href="mailto:michaelcao@gmail.com" className="text-sm text-gray-600 hover:text-orange-500">michaelcao@gmail.com</a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Column 2: Customer Support */}
          <div>
            <h2 className="font-bold text-lg text-gray-800 border-b border-orange-300 pb-2 mb-4">
              CHĂM SÓC KHÁCH HÀNG
            </h2>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-orange-500 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Chính sách đổi - trả - hoàn tiền
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-orange-500 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Hệ thống phát hành
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-orange-500 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Phương thức vận chuyển
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-orange-500 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-orange-500 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Logo section moved here */}
          <div className="text-center">
            
            
            {/* About us content moved here */}
            <h2 className="font-bold text-lg text-gray-800 border-b border-orange-300 pb-2 mb-4">
              VỀ CHÚNG TÔI
            </h2>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-orange-500 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Tủ sách
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-orange-500 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Tác giả
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-orange-500 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-orange-500 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Tin tức
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 hover:text-orange-500 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 4: Subscribe and Payment */}
          <div>
            <h2 className="font-bold text-lg text-gray-800 border-b border-orange-300 pb-2 mb-4">
              ĐĂNG KÝ NHẬN TIN
            </h2>
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <p className="text-sm text-gray-600 mb-3">Đăng ký để nhận thông tin về sách mới và khuyến mãi đặc biệt</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Nhập địa chỉ email" 
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                />
                <button className="bg-orange-500 text-white px-4 py-2 rounded-r-md hover:bg-orange-600 transition-colors shadow-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            <h2 className="font-bold text-lg text-gray-800 border-b border-orange-300 pb-2 mb-4">
              PHƯƠNG THỨC THANH TOÁN
            </h2>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-gray-200 rounded p-2 flex items-center justify-center hover:shadow-sm transition-shadow">
                  <Image src="/footer/visa.svg" alt="Visa" width={60} height={30} />
                </div>
                <div className="border border-gray-200 rounded p-2 flex items-center justify-center hover:shadow-sm transition-shadow">
                  <Image src="/footer/mastercard.svg" alt="Mastercard" width={60} height={30} />
                </div>
                <div className="border border-gray-200 rounded p-2 flex items-center justify-center hover:shadow-sm transition-shadow">
                  <Image src="/footer/momo.svg" alt="MoMo" width={60} height={20} />
                </div>
                <div className="border border-gray-200 rounded p-2 flex items-center justify-center hover:shadow-sm transition-shadow">
                  <Image src="/footer/zalopay.svg" alt="ZaloPay" width={60} height={30} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-6">
          <p className="text-sm text-center text-gray-500">
            © {new Date().getFullYear()} AtomikBooks. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;