export const calculateColumnWidth =  function (data,title,field) {
  const cellFont = '14px Avenir';
  const headerFont = '18px Avenir'
  let colWidth = calculateTextWidth(title, headerFont) + 51; // Start with column title width
  data?.forEach(row => {
      let font = cellFont;
      if(row[field]) font = row[field].toString() === row[field].toString().toUpperCase() ? headerFont : cellFont
      const cellWidth = calculateTextWidth(row[field], font) + 41; // Add padding
      if (cellWidth > colWidth) colWidth = cellWidth;
  });
  return colWidth;
}

function calculateTextWidth(text, font) {
  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d');
  context.font = font;
  return context.measureText(text).width;
}