import { readFile } from "fs/promises"


export const getAuthToken = async() => {
    const data = await readFile('./auth.json', 'utf-8')
    const cookies = JSON.parse(data).cookies
    return cookies.find(x => x.name === 'authToken').value as string
}

export const createBook = async(name: string) => {
    const res = await fetch(`http://localhost:3333/api/books`, {
        method: 'POST',
        body: JSON.stringify({ name }),
        headers: {
            'Content-Type': 'application/json',
            authorization: await getAuthToken()
        }
    })
    if (res.status !== 200) throw new Error(`Unable to create book: ${name}`)
    return res.text()
}

export const generateRandomString = (length = 5) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}