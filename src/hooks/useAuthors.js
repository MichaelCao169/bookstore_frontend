import { useState, useEffect } from 'react';
import axiosInstance from '../lib/axiosInstance';

export const useAuthors = () => {
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAuthors = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axiosInstance.get('/products/authors');
                setAuthors(response.data || []);
            } catch (err) {
                console.error('Error fetching authors:', err);
                setError(err.message || 'Failed to fetch authors');
                setAuthors([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAuthors();
    }, []);

    const refetch = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get('/products/authors');
            setAuthors(response.data || []);
        } catch (err) {
            console.error('Error fetching authors:', err);
            setError(err.message || 'Failed to fetch authors');
            setAuthors([]);
        } finally {
            setLoading(false);
        }
    };

    return { authors, loading, error, refetch };
};

export default useAuthors;
