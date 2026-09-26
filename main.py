import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")

PAGES_DIR = os.path.join(BASE_DIR, "pages")

@app.get("/")
async def index():
    return FileResponse(os.path.join(BASE_DIR, "index.html"), headers={"Cache-Control": "no-cache, must-revalidate"})

@app.get("/pages/{page_name}")
@app.get("/pages/{page_name}.html")
@app.get("/{page_name}.html")
async def serve_page(page_name: str):
    filename = f"{page_name}.html" if not page_name.endswith(".html") else page_name
    file_path = os.path.join(PAGES_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, headers={"Cache-Control": "no-cache, must-revalidate"})
    return FileResponse(os.path.join(BASE_DIR, "index.html"))

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse(os.path.join(BASE_DIR, "static", "favicon.svg"), media_type="image/svg+xml")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
