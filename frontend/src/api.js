import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

async function getCsrfCookie() {
    await axios.get('/sanctum/csrf-cookie');
}

async function request(url, options = {}) {
    try {
        const response = await axios({
            url: `/api${url}`,
            method: options.method || 'GET',
            // Если данные переданы в body, отдаем их как объект (axios сам сделает JSON)
            data: options.body || undefined,
            ...options
        });

        if (response.data && response.data.success === false) {
            throw new Error(response.data.error || response.data.message || 'Operation failed');
        }

        return response.data;
    } catch (error) {
        if (error.response) {
            if (error.response.status === 401) {
                window.dispatchEvent(new CustomEvent('unauthorized'));
                throw new Error('Session expired. Please login again.');
            }
            
            const errorData = error.response.data;
            const message = errorData.message || errorData.error || `HTTP ${error.response.status}`;
            throw new Error(message);
        } else if (error.request) {
            throw new Error('Network error. Please check if Laravel server is running.');
        } else {
            throw new Error(error.message);
        }
    }
}

export const api = {
    register(data) { return getCsrfCookie().then(() => request('/auth/register', { method: 'POST', body: data })); },
    login(data) { return getCsrfCookie().then(() => request('/auth/login', { method: 'POST', body: data })); },
    logout() { return request('/auth/logout', { method: 'POST' }); },
    me() { return request('/auth/me'); },
    updateProfile(data) { return request('/auth/update-profile', { method: 'PUT', body: data }); },
    changePassword(data) { return request('/auth/change-password', { method: 'PUT', body: data }); },

    getPosts(lang, search) {
        const params = new URLSearchParams();
        if (lang) params.append("lang", lang);
        if (search && search.trim()) params.append("search", search.trim());
        const qs = params.toString();
        return request(`/posts${qs ? `?${qs}` : ''}`);
    },
    getPost(id, lang) { return request(`/posts/${id}${lang ? `?lang=${lang}` : ''}`); },
    createPost(data) { return request('/posts', { method: 'POST', body: data }); },
    updatePost(data) { return request(`/posts/${data.id}`, { method: 'PUT', body: data }); },
    deletePost(id) { return request(`/posts/${id}`, { method: 'DELETE' }); },
    likePost(postId) { return request(`/posts/${postId}/like`, { method: 'POST' }); },

    getComments(postId) { return request(`/posts/${postId}/comments`); },
    createComment(postId, content) { return request(`/posts/${postId}/comments`, { method: 'POST', body: { content } }); },
    updateComment(id, content) { return request(`/comments/${id}`, { method: 'PUT', body: { content } }); },
    deleteComment(id) { return request(`/comments/${id}`, { method: 'DELETE' }); },
    likeComment(commentId) { return request(`/comments/${commentId}/like`, { method: 'POST' }); },

    getMenu(lang) { return request(`/menu${lang ? `?lang=${lang}` : ''}`); },
    getAdminMenu() { return request('/admin/menu'); },
    createMenuItem(data) { return request('/admin/menu', { method: 'POST', body: data }); },
    updateMenuItem(data) { return request(`/admin/menu/${data.id}`, { method: 'PUT', body: data }); },
    deleteMenuItem(id) { return request(`/admin/menu/${id}`, { method: 'DELETE' }); },
    reorderMenu(items) { return request('/admin/menu/reorder', { method: 'PUT', body: { items } }); },

    getUsers() { return request('/admin/users'); },
    blockUser(userId, isBlocked) { return request(`/admin/users/${userId}/block`, { method: 'PUT', body: { is_blocked: isBlocked } }); },
    changeRole(userId, role) { return request(`/admin/users/${userId}/role`, { method: 'PUT', body: { role } }); },
    deleteUser(userId) { return request(`/admin/users/${userId}`, { method: 'DELETE' }); },

    getLanguages() { return request('/admin/languages'); },
    getPublicLanguages() { return request('/languages'); },
    createLanguage(data) { return request('/admin/languages', { method: 'POST', body: data }); },
    updateLanguage(data) { return request(`/admin/languages/${data.id}`, { method: 'PUT', body: data }); },
    deleteLanguage(id) { return request(`/admin/languages/${id}`, { method: 'DELETE' }); },
    setActiveLanguage(id) { return request(`/admin/languages/${id}/set-active`, { method: 'PUT' }); },

    getPostImage(postId) { return request(`/images/${postId}`); },
    uploadImage(postId, file) {
        const formData = new FormData();
        formData.append('post_id', postId);
        formData.append('image', file);
        return axios.post('/api/images/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data);
    },
    deleteImage(postId) { return request(`/images/${postId}`, { method: 'DELETE' }); },

    getUserProfile(id) { return request(`/users/${id}/profile`); },
    getMyProfile() { return request('/users/me/profile'); },
    subscribe(userId) { return request(`/users/${userId}/subscribe`, { method: 'POST' }); },
    unsubscribe(userId) { return request(`/users/${userId}/unsubscribe`, { method: 'POST' }); }
};

window.addEventListener('unauthorized', () => {
    localStorage.removeItem('user');
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
    }
});