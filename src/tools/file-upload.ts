export interface UploadParams {
  accept?: string;
}

export interface MultipleUploadParams extends UploadParams {
  multiple?: boolean;
}
export function uploadFiles(params: MultipleUploadParams): Promise<FileList> {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = !!params?.multiple;
  input.accept = params?.accept;
  input.style.width = '0';
  input.style.height = '0';
  input.directory = !!params?.multiple;
  input.webkitdirectory = !!params?.multiple;
  document.body.appendChild(input);

  const abortController = new AbortController();

  const fileUploadPromise = new Promise<FileList>((resolve) => {
    input.addEventListener(
      'change',
      async () => {
        if (!input.files?.length) {
          return;
        }
        resolve(input.files);
        document.body.removeChild(input);
        abortController.abort();
      },
      { signal: abortController.signal }
    );
  });

  input.click();
  return fileUploadPromise;
}

export async function uploadFile(params: UploadParams = {}): Promise<File> {
  const files = await uploadFiles({ ...params, multiple: false });
  return files?.[0];
}
