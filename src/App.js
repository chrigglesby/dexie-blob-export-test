import React, {useState} from "react"
import { db } from "./db"
import imageCompression from 'browser-image-compression'
import { useLiveQuery } from "dexie-react-hooks"
import {importDB, exportDB} from "dexie-export-import"
import { saveAs } from "file-saver"
import image1 from "./image1.jpg"
import image2 from "./image2.jpg"
import image3 from "./image3.jpg"

function App() {
  const pictures = useLiveQuery(() => db.pictures.toArray())

  const doExport = async () => {
    // Dexie
    const dexieExportBlob = await exportDB(db)

    // Client downloads file
    saveAs(dexieExportBlob, 'blob_test.export')
  }

  const doImport = async (event) => {
    const file = event.target.files[0]
    
    const dexieImport = await importDB(file, {overwriteValues: true})
    console.log(dexieImport)
  }

  return (
    <div className="App">
      <AddPictureForm/>

      <hr></hr>

      {pictures?.map((picture) => {
        const src = URL.createObjectURL(picture.picture)
        return <>{picture.title}<img src={src} width={200} height={200} style={{padding: '10px'}}/></>
      })}

      <hr></hr>

      Import:
      <input
          id="import"
          type="file"
          onChange={doImport}
      />
      <button onClick={doExport}>Export</button>

    </div>
  )
}

export default App;

export function AddPictureForm() {
  const [title, setTitle] = useState('')
  const [picture, setPicture] = useState(null)

  async function addPicture() {
    try {
      const id = await db.pictures.add({title, picture})
      console.log(id)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      title:
      <input
        type="text"
        value={title}
        onChange={(ev) => setTitle(ev.target.value)}
      />
      picture:
      <input
          id="upload_snap_image"    
          type="file"
          accept="image/*"
          onChange={async (event) => {
            const file = event.target.files[0]

            // Compress
            console.log('originalFile instanceof Blob', file instanceof Blob); // true
            console.log(`originalFile size ${file.size / 1024 / 1024} MB`);

            const options = {
                maxSizeMB: 0.1,
                maxWidthOrHeight: 400,
                useWebWorker: true,
            }

            imageCompression(file, options).then(function (compressedFile) {
                console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
                console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // smaller than maxSizeMB
            
                setPicture(compressedFile)
            }).catch(function (error) {
                console.log(error.message);
            })
          }}
      />
      <button onClick={addPicture}>Add</button>
      <hr></hr>
      Three distinct images for testing.
      <img src={image1} alt="image1" width={200}/>
      <img src={image2} alt="image1" width={200}/>
      <img src={image3} alt="image1" width={200}/>
    </>
  )
}