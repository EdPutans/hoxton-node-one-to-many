import { addWork, addMuseum } from './app';

const seed = async () => {
  await addMuseum({ name: 'Museum of Art', city: 'New York' })
  await addMuseum({ name: 'Museum of Sick Naenaes', city: 'London' })

  await addWork({ artist: 'Katsushika Hokusai', museum_id: 1, title: 'The Great Wave off Kanagawa', picture: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/The_Great_Wave_off_Kanagawa.jpg/1280px-The_Great_Wave_off_Kanagawa.jpg", year: 1962 })
  await addWork({ artist: "Ed", museum_id: 2, title: "Snow sculpture", year: 2016, picture: "https://i.ytimg.com/vi/YmKWNTl1jZw/maxresdefault.jpg" })
  await addWork({ artist: "Nico", museum_id: 2, title: "Snow sculpture 2", year: 2013, picture: "https://iruntheinternet.com/lulzdump/images/forever-alone-snowman-perfect-meme-christmas-13540479222.jpg" })
  await addWork({ artist: "SOme dude on the internet", museum_id: 2, title: "LMAO my dog hungry", year: 2017, picture: "https://img.ifunny.co/images/bca3093ae80221c7bdb830ac9c0d30528d657930b94ac64799a21219a37f88b8_1.jpg" })
}

seed();