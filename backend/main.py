from fastapi import FastAPI
from api.routes import router

app = FastAPI(title="Rock Bee Backend")

app.include_router(router)


@app.get("/")
def health():
    return {"status": "Backend running"}
