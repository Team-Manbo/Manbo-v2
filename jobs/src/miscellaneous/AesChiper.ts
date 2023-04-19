import AES from 'aes256'
export default AES.createCipher(process.env.AES_KEY as string)