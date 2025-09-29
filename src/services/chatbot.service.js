

import {apiFetch} from './api.service.js'


export const getChats = () => {
    return apiFetch.get("/chats");
};

export const checkSession = () => {
  return apiFetch.get("/check-session");
};

export const getBlogs = () => {
    return apiFetch.get("/blogs");
};

export const getTags = () => {
    return apiFetch.get("/get_tags");
};

export const getListNickname = () => {
    return apiFetch.get("/get_nickname");
};


// export const verifyEmail = () => {
//     return apiFetch.get("/verify_email");
// };
// export const getBlogID = (public_id) => {
//   const res = apiFetch.get(`/blogs/${public_id}`);
//   return res.json();
// }