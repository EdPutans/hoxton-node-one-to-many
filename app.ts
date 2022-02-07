import Database from 'better-sqlite3';
import express from 'express';
import cors from 'cors';
import { Resp, Work, Museum } from './types'

const app = express();
app.use(express.json());
app.use(cors());

const db = new Database(
  'museums.db',
  { verbose: console.log }
);

// #region init
const initWorks = db.prepare(`CREATE TABLE IF NOT EXISTS works (
  title text NOT NULL,
  artist text NOT NULL,
  year integer NOT NULL,
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  museum_id INTEGER,
  FOREIGN KEY(museum_id) REFERENCES museums(id)
);
`);

const initMuseums = db.prepare(`CREATE TABLE IF NOT EXISTS  museums (
  name text NOT NULL,
  address text NOT NULL,
  id INTEGER PRIMARY KEY AUTOINCREMENT
);  `)

initWorks.run()
initMuseums.run()

//#endregion

//#region Queries
const selectAllWorks = () => db.prepare(`SELECT * FROM works;`).all()
const selectAllMuseums = () => db.prepare(`SELECT * FROM museums`).all()

const selectWorkById = (id: number) => db.prepare(`SELECT * FROM works where id=?;`).get(id);
const selectMuseumById = (id: number) => db.prepare(`SELECT * FROM museums where id=?`).get(id);

const selectAllArtsForMuseum = (id: number) => db.prepare(`SELECT * FROM works WHERE museum_id = ?`).all(id);
const selectMuseumForArt = (id: number) => db.prepare(`SELECT * FROM museums WHERE id = ?`).get(id);

const addWork = ({ title, artist, year, museum_id }: Omit<Work, 'id'>) => db.prepare(`INSERT INTO works (title, artist, year, museum_id) VALUES (?, ?, ?, ?);`)
  .run(title, artist, year, museum_id);

const addMuseum = ({ name, address }: Omit<Museum, 'id'>) => db.prepare(`INSERT INTO museums (name, address) VALUES (?, ?);`)
  .run(name, address);

//#endregion

//#region modifiers
const addMuseumToWork = async (workArg: Work): Promise<Work | null> => {
  if (!workArg) return null;

  const work = { ...workArg }
  const museum = await selectMuseumForArt(work.museum_id);

  work.museum = museum;
  return work;
}

const getWorksInMuseum = async (museumArg: Museum): Promise<Museum | null> => {
  if (!museumArg) return null;

  const museum = { ...museumArg };

  const works = await selectAllArtsForMuseum(museum.id)
  museum.works = works

  return museum;
}
//#endregion

//#region routes

app.get('/works/:id', async (req, res: Resp<Work>) => {
  const work = selectWorkById(Number(req.params.id));

  if (!work) res.status(400).send({ error: 'Work not found' });
  const workWithMuseum = await addMuseumToWork(work);

  if (!workWithMuseum) return res.status(400).send({ error: 'Work not found' });

  res.send({ data: workWithMuseum })
})

app.get('/museums/:id', async (req, res: Resp<Museum>) => {
  const museum = selectMuseumById(Number(req.params.id));
  if (!museum) res.status(400).send({ error: 'Museum not found' });

  const museumWithWorks = await getWorksInMuseum(museum);

  if (!museumWithWorks) return res.status(400).send({ error: 'Museum not found' });

  res.send({ data: museumWithWorks })
})


app.post('/museums', async (req: { body: Omit<Museum, 'id'> }, res: Resp<Museum>) => {
  if (!req.body.address || !req.body.name) res.status(400).send({ 'error': 'Missing required field' });

  const { name, address } = req.body;
  const info = await addMuseum({ name, address });

  if (!info.lastInsertRowid) res.status(500).send({ error: 'Could not add museum. Investigate.' });

  const museum = await selectMuseumById(Number(info.lastInsertRowid));
  if (!museum) res.status(500).send({ error: 'Could not add museum. Investigate.' });

  const museumResult = await getWorksInMuseum(museum)
  if (!museumResult) return res.status(500).send({ error: 'Could not add museum. Investigate.' });

  res.send({ data: museumResult })
})

app.post('/works', async (req: { body: Omit<Work, 'id'> }, res: Resp<Work>) => {
  if (!req.body.artist || !req.body.museum_id || !req.body.title || !req.body.year) res.status(400).send({ 'error': 'Missing required field' });

  const { artist, museum_id, title, year } = req.body;

  const info = await addWork({ artist, museum_id, title, year, });
  if (!info.lastInsertRowid) res.status(500).send({ error: 'Could not add piece. Investigate.' });

  const work = await selectWorkById(Number(info.lastInsertRowid));
  const workWithMuseumData = await addMuseumToWork(work)

  if (!workWithMuseumData) return res.status(500).send({ error: 'Could not add piece. Investigate.' });

  res.send({ data: workWithMuseumData })
})

// not a REQ but convenient:
app.get('/museums', async (_, res: Resp<Museum[]>) => {
  const museums = await selectAllMuseums()
  let museumsWithWorks = [];

  for (let museum of museums) {
    const completeMuseum = await getWorksInMuseum(museum)
    if (!completeMuseum) continue;

    museumsWithWorks.push(completeMuseum);
  }

  res.send({ data: museumsWithWorks })

})
app.get('/works', async (_, res: Resp<Work[]>) => {
  const works = await selectAllWorks();
  let worksWithMuseumData = [];

  for (let work of works) {
    const workWithMuseum = await addMuseumToWork(work)
    if (!workWithMuseum) continue;

    worksWithMuseumData.push(workWithMuseum);
  }

  res.send({ data: worksWithMuseumData })
})
//#endregion

app.listen(4000, () => {
  console.info('listening on port 4000');
})


