import { Document as DocxDocument, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

// Helper to strip HTML and get clean text
const stripHtml = (html: string) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export const exportToTxt = (title: string, content: string) => {
  const text = stripHtml(content);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${title || 'document'}.txt`);
};

export const exportToDocx = async (title: string, content: string) => {
  // Simple HTML to DOCX conversion
  // We'll split by common tags to create paragraphs
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  
  const children = Array.from(tempDiv.children);
  const docxParagraphs: Paragraph[] = [];

  if (children.length === 0) {
    docxParagraphs.push(new Paragraph({
      children: [new TextRun(tempDiv.textContent || "")]
    }));
  } else {
    children.forEach(child => {
      const text = child.textContent || "";
      if (!text.trim()) return;

      let heading;
      if (child.tagName === 'H1') heading = HeadingLevel.HEADING_1;
      if (child.tagName === 'H2') heading = HeadingLevel.HEADING_2;
      if (child.tagName === 'H3') heading = HeadingLevel.HEADING_3;

      docxParagraphs.push(new Paragraph({
        text: text,
        heading: heading
      }));
    });
  }

  const doc = new DocxDocument({
    sections: [{
      properties: {},
      children: docxParagraphs,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title || 'document'}.docx`);
};

export const exportToPdf = () => {
  // The most reliable browser-side PDF export is window.print()
  // We can trigger it and users can "Save as PDF"
  window.print();
};
