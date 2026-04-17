// ── Export Utilities (PDF, Excel, Word) ──
// Libraries loaded via CDN in the HTML pages that need them

export async function exportToExcel(data, sheetName, fileName) {
  if (typeof XLSX === 'undefined') {
    throw new Error('SheetJS library not loaded');
  }
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName || 'Report');
  XLSX.writeFile(wb, fileName || 'LagoonGame_Report.xlsx');
}

export async function exportMultiSheetExcel(sheets, fileName) {
  if (typeof XLSX === 'undefined') {
    throw new Error('SheetJS library not loaded');
  }
  const wb = XLSX.utils.book_new();
  for (const sheet of sheets) {
    const ws = XLSX.utils.json_to_sheet(sheet.data);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  }
  XLSX.writeFile(wb, fileName || 'LagoonGame_Report.xlsx');
}

export async function exportToPDF(title, subtitle, columns, rows, fileName) {
  if (typeof window.jspdf === 'undefined') {
    throw new Error('jsPDF library not loaded');
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(10, 36, 99);
  doc.text(title, 20, 20);

  if (subtitle) {
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, 20, 30);
  }

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 38);

  // Table
  doc.autoTable({
    head: [columns],
    body: rows,
    startY: 44,
    theme: 'grid',
    headStyles: {
      fillColor: [21, 101, 192],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [240, 244, 248] },
    margin: { left: 20, right: 20 }
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Thai Lagoon Adventure - Page ${i}/${pageCount}`, 20, doc.internal.pageSize.height - 10);
  }

  doc.save(fileName || 'LagoonGame_Report.pdf');
}

export async function exportToWord(title, subtitle, columns, rows, fileName) {
  if (typeof docx === 'undefined') {
    throw new Error('docx.js library not loaded');
  }

  const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle, HeadingLevel } = docx;

  const headerCells = columns.map(col =>
    new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: col, bold: true, color: 'FFFFFF', size: 20 })] })],
      shading: { fill: '1565C0' },
      width: { size: Math.floor(100 / columns.length), type: WidthType.PERCENTAGE }
    })
  );

  const tableRows = [new TableRow({ children: headerCells })];

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].map(cell =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: String(cell || ''), size: 18 })] })],
        shading: i % 2 === 0 ? {} : { fill: 'F0F4F8' },
        width: { size: Math.floor(100 / columns.length), type: WidthType.PERCENTAGE }
      })
    );
    tableRows.push(new TableRow({ children: cells }));
  }

  const document = new Document({
    sections: [{
      children: [
        new Paragraph({
          children: [new TextRun({ text: title, bold: true, size: 36, color: '0A2463' })],
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 }
        }),
        ...(subtitle ? [new Paragraph({
          children: [new TextRun({ text: subtitle, size: 22, color: '666666' })],
          spacing: { after: 100 }
        })] : []),
        new Paragraph({
          children: [new TextRun({ text: `Generated: ${new Date().toLocaleString()}`, size: 16, color: '999999' })],
          spacing: { after: 300 }
        }),
        new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }),
        new Paragraph({
          children: [new TextRun({ text: '\nThai Lagoon Island Adventure - Student Report', size: 16, color: '999999', italics: true })],
          spacing: { before: 400 }
        })
      ]
    }]
  });

  const blob = await Packer.toBlob(document);
  const url = URL.createObjectURL(blob);
  const a = window.document.createElement('a');
  a.href = url;
  a.download = fileName || 'LagoonGame_Report.docx';
  a.click();
  URL.revokeObjectURL(url);
}
