'use client';

import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance';

export const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/api/categories');
                setCategories(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('Không thể tải danh sách danh mục. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories, loading, error };
}; 