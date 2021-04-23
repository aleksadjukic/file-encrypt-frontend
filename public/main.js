const uploadInputEl = document.getElementById('upload-input');
const uploadBtnEl = document.getElementById('upload-btn');
const uploadBtnTextEl = document.getElementById('upload-btn-text');
const encryptBtnEl = document.getElementById('encrypt-btn');
const decryptBtnEl = document.getElementById('decrypt-btn');
const selectKeyEl = document.getElementById('select-key')
const formData = new FormData();

let fileToUpload = ''

fetch('https://file-encrypt.herokuapp.com/api/generateKeys').then(res => res.json()).then(result => {
  console.log('Helllooo')
  result.forEach((key, idx) => {
    let keyEl = document.createElement('option')
    keyEl.setAttribute('value', key)
    keyEl.innerText = `Key #${idx + 1}`
    selectKeyEl.insertAdjacentElement('beforeend', keyEl)
  })
})

uploadBtnEl.addEventListener('click', () => {
  uploadInputEl.click()
})

uploadInputEl.addEventListener('change', (e) => {
  if (uploadInputEl.files.length > 0) {
    uploadBtnTextEl.innerHTML = uploadInputEl.files[0].name
    fileToUpload = uploadInputEl.files[0].name
  } else {
    uploadBtnTextEl.innerHTML = 'No file selected.'
  }
})

encryptBtnEl.addEventListener('click', () => {
  formData.delete('key')
  formData.delete('fileToEncrypt')
  formData.append('key', selectKeyEl.value)
  formData.append('fileToEncrypt', uploadInputEl.files[0])
  if (!uploadInputEl.files[0]) {
    alert("Please choose a file that you want to encrypt!")
    return
  }
  if (!selectKeyEl.value || selectKeyEl.value === '') {
    alert("Please select a key!")
    return
  }

  fetch('https://file-encrypt.herokuapp.com/api/encrypt', { method: 'POST', body: formData },).then(res => res.json()).then(result => {
    console.log(result)
    if (result.status === 'fail') {
      alert(result.message)
      return
    }

    let blobFile = new Blob([new Uint8Array(result.fileContents.data).buffer])
    console.log('blob', blobFile)
    downloadBlob(blobFile, `${result.name}.enc`)
  })
})
decryptBtnEl.addEventListener('click', () => {
  console.log(selectKeyEl.value)
  formData.delete('key')
  formData.delete('fileToDecrypt')
  formData.append('key', selectKeyEl.value)
  formData.append('fileToDecrypt', uploadInputEl.files[0])
  if (!uploadInputEl.files[0]) {
    alert("Please choose a file that you want to decrypt!")
    return
  }
  if (!selectKeyEl.value || selectKeyEl.value === '') {
    alert("Please select a key!")
    return
  }

  fetch('https://file-encrypt.herokuapp.com/api/decrypt', { method: 'POST', body: formData },).then(res => res.json()).then(result => {
    console.log(result)
    if (result.status === 'fail') {
      alert(result.message)
      return
    }
    let blobFile = new Blob([new Uint8Array(result.fileContents.data).buffer])
    console.log('blob', blobFile)
    downloadBlob(blobFile, result.name)
  })
})

function downloadBlob(blob, name = 'file.txt') {
  // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
  const blobUrl = URL.createObjectURL(blob);

  // Create a link element
  const link = document.createElement("a");

  // Set link's href to point to the Blob URL
  link.href = blobUrl;
  link.download = name;

  // Append link to the body
  document.body.appendChild(link);

  // Dispatch click event on the link
  // This is necessary as link.click() does not work on the latest firefox
  link.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    })
  );

  // Remove link from body
  document.body.removeChild(link);
}