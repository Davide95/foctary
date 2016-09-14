function downloadCanvas(canvas, linkElem) {
  // IE 10+ fix
  if (window.Blob && window.navigator.msSaveOrOpenBlob)
    window.navigator.msSaveBlob(canvas.msToBlob(), linkElem.getAttribute('download'));
  else
    linkElem.setAttribute('href', canvas.toDataURL().replace(/^data:image\/[^;]/, 'data:application/octet-stream'));
}
