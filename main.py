import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")

@app.get("/")
async def index():
    return FileResponse(os.path.join(BASE_DIR, "index.html"), headers={"Cache-Control": "no-cache, must-revalidate"})

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse(os.path.join(BASE_DIR, "static", "favicon.svg"), media_type="image/svg+xml")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
