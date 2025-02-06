import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContestCreate from './ContestCreate';

const ContestEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch contest data by id
        const fetchContestData = async () => {
            try {
                const response = await fetch(`/api/contests/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setInitialData(data);
                } else {
                    console.error('Error fetching contest:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching contest:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContestData();
    }, [id]);

    const handleUpdate = useCallback(async (updatedData) => {
        try {
            const response = await fetch(`/api/contests/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                alert('コンテストが更新されました！');
                navigate('/contests');
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'コンテスト更新に失敗しました。');
            }
        } catch (error) {
            console.error('Error updating contest:', error);
            alert('エラーが発生しました。');
        }
    }, [id, navigate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>コンテスト編集</h1>
            {initialData && <ContestCreate initialData={initialData} onSubmit={handleUpdate} />}
        </div>
    );
};

export default ContestEdit;