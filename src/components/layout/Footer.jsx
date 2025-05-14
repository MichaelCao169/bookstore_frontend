import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiMapPin, FiMail, FiPhone, FiChevronRight, FiSend, FiHeart } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-12 pb-8 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Column 1: Address Information */}
          <div className="space-y-4">
            <h2 className="font-bold text-lg text-gray-800 dark:text-white border-b border-orange-300 dark:border-orange-500 pb-2 mb-4">
              CHI NHÁNH
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-orange-600 dark:text-orange-400 mb-1">HÀ NỘI</h3>
                <div className="flex items-start space-x-2">
                  <FiMapPin className="w-5 h-5 text-orange-500 dark:text-orange-400 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Số 3 Hoàng Dương Thanh Ba Phú Thọ<br />
                    <span className="font-medium">Sđt: 0123654789</span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-orange-600 dark:text-orange-400 mb-1">HỒ CHÍ MINH</h3>
                <div className="flex items-start space-x-2">
                  <FiMapPin className="w-5 h-5 text-orange-500 dark:text-orange-400 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    66B Nguyễn Sỹ Sách phường 15 quận Tân Bình<br />
                    <span className="font-medium">Sđt: 0123654789</span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-orange-600 dark:text-orange-400 mb-1">EMAIL</h3>
                <div className="flex items-center space-x-2">
                  <FiMail className="w-5 h-5 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                  <a href="mailto:michaelcao@gmail.com" className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                    michaelcao@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Customer Support */}
          <div>
            <h2 className="font-bold text-lg text-gray-800 dark:text-white border-b border-orange-300 dark:border-orange-500 pb-2 mb-4">
              CHĂM SÓC KHÁCH HÀNG
            </h2>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 flex items-center transition-colors">
                  <FiChevronRight className="w-4 h-4 mr-2 text-orange-500 dark:text-orange-400" />
                  Chính sách đổi - trả - hoàn tiền
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 flex items-center transition-colors">
                  <FiChevronRight className="w-4 h-4 mr-2 text-orange-500 dark:text-orange-400" />
                  Hệ thống phát hành
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 flex items-center transition-colors">
                  <FiChevronRight className="w-4 h-4 mr-2 text-orange-500 dark:text-orange-400" />
                  Phương thức vận chuyển
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 flex items-center transition-colors">
                  <FiChevronRight className="w-4 h-4 mr-2 text-orange-500 dark:text-orange-400" />
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 flex items-center transition-colors">
                  <FiChevronRight className="w-4 h-4 mr-2 text-orange-500 dark:text-orange-400" />
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: About Us */}
          <div>
            <h2 className="font-bold text-lg text-gray-800 dark:text-white border-b border-orange-300 dark:border-orange-500 pb-2 mb-4">
              VỀ CHÚNG TÔI
            </h2>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 flex items-center transition-colors">
                  <FiChevronRight className="w-4 h-4 mr-2 text-orange-500 dark:text-orange-400" />
                  Tủ sách
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 flex items-center transition-colors">
                  <FiChevronRight className="w-4 h-4 mr-2 text-orange-500 dark:text-orange-400" />
                  Tác giả
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 flex items-center transition-colors">
                  <FiChevronRight className="w-4 h-4 mr-2 text-orange-500 dark:text-orange-400" />
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 flex items-center transition-colors">
                  <FiChevronRight className="w-4 h-4 mr-2 text-orange-500 dark:text-orange-400" />
                  Tin tức
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 flex items-center transition-colors">
                  <FiChevronRight className="w-4 h-4 mr-2 text-orange-500 dark:text-orange-400" />
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Subscribe and Payment */}
          <div>
            <h2 className="font-bold text-lg text-gray-800 dark:text-white border-b border-orange-300 dark:border-orange-500 pb-2 mb-4">
              ĐĂNG KÝ NHẬN TIN
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm dark:shadow-gray-900/10 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Đăng ký để nhận thông tin về sách mới và khuyến mãi đặc biệt</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Nhập địa chỉ email"
                  className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-l-md focus:outline-none focus:ring-1 focus:ring-orange-500 dark:focus:ring-orange-400 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                />
                <button className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white px-4 py-2 rounded-r-md transition-colors shadow-sm flex items-center">
                  <FiSend className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h2 className="font-bold text-lg text-gray-800 dark:text-white border-b border-orange-300 dark:border-orange-500 pb-2 mb-4">
              PHƯƠNG THỨC THANH TOÁN
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm dark:shadow-gray-900/10">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-center h-14 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="relative w-20 h-10">
                    <Image
                      src="/footer/visa.svg"
                      alt="Visa"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center h-14 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="relative w-20 h-10">
                    <Image
                      src="/footer/mastercard.svg"
                      alt="Mastercard"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center h-14 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="relative w-20 h-10">
                    <Image
                      src="/footer/momo.svg"
                      alt="MoMo"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center h-14 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="relative w-20 h-10">
                    <Image
                      src="/footer/zalopay.svg"
                      alt="ZaloPay"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-6">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 flex items-center justify-center">
            © {currentYear} AtomikBooks. Bản quyền thuộc về AtomikBooks
            <FiHeart className="mx-1 text-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;