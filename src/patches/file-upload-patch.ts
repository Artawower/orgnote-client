import { Axios } from 'axios';

// NOTE: patch cause of incorrect generated api (form-data and swaggo)
export const initFilesApi = (axiosInstance: Axios) => {
  return {
    uploadFile: async (file: File) => {
      const formData = new FormData();
      formData.append('files', file);
      const response = await axiosInstance.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    downloadFile: async (userId: string, fileName: string): Promise<Blob> => {
      const url = `/media/${userId}/${fileName}`;
      const response = await axiosInstance.request({
        url,
        method: 'GET',
        responseType: 'blob',
      });
      return response.data;
    },
  } as const;
};
