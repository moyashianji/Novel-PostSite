import { useCallback } from 'react';

export const useAPI = () => {
  const API_URL = process.env.REACT_APP_API_URL;

  const fetchWithCredentials = async (endpoint) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        console.error(`Failed to fetch from ${endpoint}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      return null;
    }
  };

  const fetchUserData = useCallback(async () => {
    return await fetchWithCredentials('/api/user/me');
  }, []);

  const fetchMyWorks = useCallback(async () => {
    return await fetchWithCredentials('/api/users/me/works');
  }, []);

  const fetchMySeries = useCallback(async () => {
    return await fetchWithCredentials('/api/users/me/series');
  }, []);

  const fetchFollowingList = useCallback(async () => {
    return await fetchWithCredentials('/api/users/following');
  }, []);

  const fetchFollowerList = useCallback(async () => {
    return await fetchWithCredentials('/api/users/followers');
  }, []);

  const fetchLikedPosts = useCallback(async () => {
    return await fetchWithCredentials('/api/posts/user/liked');
  }, []);

  const fetchBookshelf = useCallback(async () => {
    return await fetchWithCredentials('/api/me/bookshelf');
  }, []);

  const fetchBookmarks = useCallback(async () => {
    return await fetchWithCredentials('/api/me/bookmarks');
  }, []);

  const fetchContests = useCallback(async () => {
    return await fetchWithCredentials('/api/users/me/contests');
  }, []);

  return {
    API_URL,
    fetchUserData,
    fetchMyWorks,
    fetchMySeries,
    fetchFollowingList,
    fetchFollowerList,
    fetchLikedPosts,
    fetchBookshelf,
    fetchBookmarks,
    fetchContests
  };
};
