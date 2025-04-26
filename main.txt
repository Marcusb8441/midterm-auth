from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List

app = FastAPI()

app.mount("/static", StaticFiles(directory="frontend"), name="static")

# Route to serve index.html at the root URL
@app.get("/")
async def serve_index():
    return FileResponse("frontend/index.html")

class Property(BaseModel):
    id: int
    name: str  
    address: str
    visited: bool = False
    comments: str = ""

# In-memory database (list of properties)
properties_db = []

@app.post("/properties/")
async def create_property(property: Property):
    properties_db.append(property)
    return {"message": "Property added successfully", "property": property}

@app.get("/properties/", response_model=List[Property])
async def get_properties():
    return properties_db

@app.put("/properties/{property_id}")
async def update_property(property_id: int, property: Property):
    for idx, p in enumerate(properties_db):
        if p.id == property_id:
            properties_db[idx] = property
            return {"message": "Property updated", "property": property}
    raise HTTPException(status_code=404, detail="Property not found")

@app.delete("/properties/{property_id}")
async def delete_property(property_id: int):
    for idx, p in enumerate(properties_db):
        if p.id == property_id:
            del properties_db[idx]
            return {"message": "Property deleted"}
    raise HTTPException(status_code=404, detail="Property not found")
