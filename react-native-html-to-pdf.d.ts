// types/react-native-html-to-pdf.d.ts
declare module "react-native-html-to-pdf" {
  export interface PDFOptions {
    html: string;
    fileName: string;
    directory?: string;
    base64?: boolean;
  }

  export interface PDFFile {
    filePath: string;
    base64?: string;
    uri?: string;
  }

  const RNHTMLtoPDF: {
    convert(options: PDFOptions): Promise<PDFFile>;
  };

  export default RNHTMLtoPDF;
}
