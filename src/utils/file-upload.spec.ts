import { uploadFile, uploadFiles } from './file-upload';
import { test, expect, vi, type Mock } from 'vitest';

vi.stubGlobal('document', {
  createElement: vi.fn(),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
});

test('uploadFiles should resolve with a FileList when files are selected', async () => {
  const mockFile = new File(['content'], 'file.txt', { type: 'text/plain' });
  const mockFileList = {
    0: mockFile,
    length: 1,
    item: (index: number) => (index === 0 ? mockFile : null),
  } as unknown as FileList;

  const mockInput = {
    type: 'file',
    multiple: true,
    accept: 'image/*',
    files: null,
    style: { display: '' },
    click: vi.fn(),
    addEventListener: vi.fn(),
  } as unknown as HTMLInputElement;

  const addEventListenerMock = mockInput.addEventListener as Mock;
  addEventListenerMock.mockImplementation((event, callback) => {
    if (event === 'change') {
      mockInput.files = mockFileList;
      callback();
    }
  });

  (document.createElement as Mock).mockReturnValue(mockInput);

  const params = { accept: 'image/*', multiple: true };
  const result = await uploadFiles(params);

  expect(result).toBe(mockFileList);
  expect(mockInput.click).toHaveBeenCalled();
  expect(document.body.appendChild).toHaveBeenCalledWith(mockInput);
  expect(document.body.removeChild).toHaveBeenCalledWith(mockInput);
});

test('uploadFiles should reject with an error if no files are selected', async () => {
  const mockInput = {
    type: 'file',
    multiple: false,
    accept: '',
    files: null,
    style: { display: '' },
    click: vi.fn(),
    addEventListener: vi.fn(),
  } as unknown as HTMLInputElement;

  const addEventListenerMock = mockInput.addEventListener as Mock;
  addEventListenerMock.mockImplementation((event, callback) => {
    if (event === 'change') {
      callback();
    }
  });

  (document.createElement as Mock).mockReturnValue(mockInput);

  const params = { accept: '' };

  await expect(uploadFiles(params)).rejects.toThrowError('No files selected');
  expect(mockInput.click).toHaveBeenCalled();
  expect(document.body.appendChild).toHaveBeenCalledWith(mockInput);
  expect(document.body.removeChild).toHaveBeenCalledWith(mockInput);
});

test('uploadFile should resolve with the first file when one file is selected', async () => {
  const mockFile = new File(['content'], 'file.txt', { type: 'text/plain' });
  const mockFileList = {
    0: mockFile,
    length: 1,
    item: (index: number) => (index === 0 ? mockFile : null),
  } as unknown as FileList;

  const mockInput = {
    type: 'file',
    multiple: false,
    accept: '',
    files: mockFileList,
    style: { display: '' },
    click: vi.fn(),
    addEventListener: vi.fn(),
  } as unknown as HTMLInputElement;

  const addEventListenerMock = mockInput.addEventListener as Mock;
  addEventListenerMock.mockImplementation((event, callback) => {
    if (event === 'change') {
      callback();
    }
  });

  (document.createElement as Mock).mockReturnValue(mockInput);

  const params = { accept: '' };
  const result = await uploadFile(params);

  expect(result).toBe(mockFile);
  expect(mockInput.click).toHaveBeenCalled();
  expect(document.body.appendChild).toHaveBeenCalledWith(mockInput);
  expect(document.body.removeChild).toHaveBeenCalledWith(mockInput);
});

test('uploadFile should throw an error if no file is selected', async () => {
  const mockInput = {
    type: 'file',
    multiple: false,
    accept: '',
    files: null,
    style: { display: '' },
    click: vi.fn(),
    addEventListener: vi.fn(),
  } as unknown as HTMLInputElement;

  const addEventListenerMock = mockInput.addEventListener as Mock;
  addEventListenerMock.mockImplementation((event, callback) => {
    if (event === 'change') {
      callback();
    }
  });

  (document.createElement as Mock).mockReturnValue(mockInput);

  const params = { accept: '' };

  await expect(uploadFile(params)).rejects.toThrowError('No files selected');
  expect(mockInput.click).toHaveBeenCalled();
  expect(document.body.appendChild).toHaveBeenCalledWith(mockInput);
  expect(document.body.removeChild).toHaveBeenCalledWith(mockInput);
});
