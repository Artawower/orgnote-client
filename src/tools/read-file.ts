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

export const readFile = async (file: FileSystemEntry): Promise<File> => {
  return new Promise((resolve, reject) => {
    (file as FileSystemFileEntry).file(resolve, reject);
  });
};

export const readOrgFile = async (
  entry: FileSystemEntry
): Promise<FileInfo> => {
  const file = await readFile(entry);
  const fileText = await readFileText(file);
  return {
    filePath: entry.fullPath.slice(1).split('/'),
    content: fileText,
  };
};
