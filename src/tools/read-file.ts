interface FileInfo {
  filePath: string[];
  content: string;
}

export const readFileText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(reader.error);
    };
    reader.readAsText(file);
  });
};

export const readFile = async (fileEntry: FileSystemEntry): Promise<File> => {
  return new Promise((resolve, reject) => {
    (fileEntry as FileSystemFileEntry).file(resolve, reject);
  });
};

export const readOrgFile = async (
  entry: FileSystemEntry | File
): Promise<FileInfo> => {
  const file = entry instanceof File ? entry : await readFile(entry);
  const fileText = await readFileText(file);
  const path =
    entry instanceof File
      ? file.webkitRelativePath || file.name
      : entry.fullPath;

  const filePath = path.split('/').filter((p) => !!p);

  return {
    filePath,
    content: fileText,
  };
};
