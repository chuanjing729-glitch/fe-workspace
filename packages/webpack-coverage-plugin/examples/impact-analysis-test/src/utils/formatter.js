// src/utils/formatter.js
export const formatTitle = (title) => {
  if (!title) {
    return '';
  }
  
  return title.toUpperCase();
};

export const formatDate = (date) => {
  if (!date) {
    return '';
  }
  
  return new Date(date).toLocaleDateString();
};