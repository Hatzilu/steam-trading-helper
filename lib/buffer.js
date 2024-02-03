


// Helper function to concatenate multiple ArrayBuffers
export function concatenateArrayBuffers(buffers) {
    console.log(buffers);
    let totalLength = buffers.reduce((acc, buffer) => {
        console.log({acc, buffer});
        if (typeof buffer?.byteLength === 'number') {
            return acc + buffer.byteLength
        }
        else {console.log('not  a number', {buffer}); return acc;}
    }, 0);
    let concatenatedBuffer = new Uint8Array(totalLength);
    let offset = 0;
  
    buffers.forEach(buffer => {
      concatenatedBuffer.set(new Uint8Array(buffer), offset);
      offset += buffer.byteLength;
    });
  
    return concatenatedBuffer.buffer;
}

// Helper function to convert ArrayBuffer to string
export function arrayBufferToString(buffer) {
    return new TextDecoder().decode(new Uint8Array(buffer));
}
