import axios from "axios"
const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }
export const uploadImage = async (img, access_token) => {
    let imgUrl = null

    const response = await axios.get(
        `/api/v1/blogs/get-upload-url`,
        {
            headers: { "Authorization": `Bearer ${access_token}` }
        }
    )

    const { uploadUrl } = response?.data
    console.log( await getBase64(img))
    await axios({
        method: "PUT",
        url: uploadUrl,
        
        data: {
            img: await getBase64(img)
        },
    })

    imgUrl = uploadUrl.split("?")[0]

    return imgUrl
}
