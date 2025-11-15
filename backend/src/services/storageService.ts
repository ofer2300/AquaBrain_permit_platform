interface StoredFile {
  buffer: Buffer;
  metadata: {
    filename: string;
    mimetype: string;
    size: number;
  };
}

class StorageService {
  private storage: Map<string, StoredFile> = new Map();

  store(fileId: string, buffer: Buffer, metadata: { filename: string; mimetype: string; size: number }): void {
    this.storage.set(fileId, { buffer, metadata });
  }

  retrieve(fileId: string): StoredFile | undefined {
    return this.storage.get(fileId);
  }

  delete(fileId: string): boolean {
    return this.storage.delete(fileId);
  }

  clear(): void {
    this.storage.clear();
  }
}

export default new StorageService();
