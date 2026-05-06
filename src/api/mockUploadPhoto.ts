export type MockUploadResponse = {
  uploadId: string;
  fileName: string;
  imageUrl: string;
  uploadedAt: string;
  diagnosisRequestId?: number;
  diagnosisResultId?: number;
};

const MOCK_UPLOAD_DELAY_MS = 900;

export function mockUploadPhoto(file: File): Promise<MockUploadResponse> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (!file.type.startsWith("image/")) {
        reject(new Error("이미지 파일만 업로드할 수 있어요."));
        return;
      }

      resolve({
        uploadId: crypto.randomUUID(),
        fileName: file.name,
        imageUrl: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
      });
    }, MOCK_UPLOAD_DELAY_MS);
  });
}
