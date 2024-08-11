const fs = require("fs");
const pdfmake = require("pdfmake");

function generatePDF(data) {
  const fonts = {
    IBM: {
      normal: "./IBM_Plex_Sans_Arabic/IBMPlexSansArabic-Regular.ttf",
      bold: "./IBM_Plex_Sans_Arabic/IBMPlexSansArabic-Bold.ttf",
    },
  };

  const printer = new pdfmake(fonts);

  const tableData = [
    [
      { text: "School Name", style: "header", alignment: "center" },
      { text: "Promoter", style: "header", alignment: "center" },
      { text: "Cash", style: "header", alignment: "center" },
      { text: "Bill", style: "header", alignment: "center" },
      { text: "Expenses", style: "header", alignment: "center" },
      { text: "Returns", style: "header", alignment: "center" },
      { text: "Previous Inventory Date", style: "header", alignment: "center" },
      {
        text: "Previous Inventory Total",
        style: "header",
        alignment: "center",
      },
      { text: "Current Inventory Date", style: "header", alignment: "center" },
      { text: "Current Inventory Total", style: "header", alignment: "center" },
      { text: "Sent Bills", style: "header", alignment: "center" },
      { text: "Received Bills", style: "header", alignment: "center" },
      { text: "Difference", style: "header", alignment: "center" },
    ],
  ];

  data.forEach((item) => {
    tableData.push([
      { text: item.school_name, alignment: "center" },
      { text: item.promoter, alignment: "center" },
      { text: item.cash.toFixed(1), alignment: "center" },
      { text: item.bill.toFixed(1), alignment: "center" },
      { text: item.expenses.toFixed(1), alignment: "center" },
      { text: item.returns.toFixed(1), alignment: "center" },
      { text: item.previous_inventory_date.slice(0, 10), alignment: "center" },
      { text: item.previous_inventory_total.toFixed(1), alignment: "center" },
      { text: item.current_inventory_date.slice(0, 10), alignment: "center" },
      { text: item.current_inventory_total.toFixed(1), alignment: "center" },
      { text: item.sent_bills.toFixed(1), alignment: "center" },
      { text: item.received_bills.toFixed(1), alignment: "center" },
      { text: item.difference.toFixed(1), alignment: "center" },
    ]);
  });

  const docDefinition = {
    defaultStyle: {
      font: "IBM",
    },
    pageOrientation: "landscape",

    content: [
      {
        text: "Check Schools Balance AT  " + new Date().toUTCString(),
        style: "header",
      },
      {
        table: {
          headerRows: 1,
          widths: Array.from({ length: 13 }, () => "auto"),
          body: tableData,
        },
      },
    ],
    styles: {
      header: {
        bold: true,
        fontSize: 12,
      },
      fontSize: 5,
    },
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);

  pdfDoc.pipe(fs.createWriteStream("check.pdf")); // Output PDF to a file
  pdfDoc.end();
}

module.exports = generatePDF;
