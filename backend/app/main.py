from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import routes_auth, routes_dashboard, routes_files, routes_investor, routes_units, routes_users
from app.core.config import settings
from app.core.middleware import SecurityHeadersMiddleware
from app.db.init_db import init_db

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=['GET', 'POST', 'PATCH', 'DELETE'],
    allow_headers=['Authorization', 'Content-Type'],
)
app.add_middleware(SecurityHeadersMiddleware)

app.include_router(routes_auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(routes_users.router, prefix=settings.API_V1_PREFIX)
app.include_router(routes_units.router, prefix=settings.API_V1_PREFIX)
app.include_router(routes_files.router, prefix=settings.API_V1_PREFIX)
app.include_router(routes_dashboard.router, prefix=settings.API_V1_PREFIX)
app.include_router(routes_investor.router, prefix=settings.API_V1_PREFIX)


@app.on_event('startup')
def startup_event():
    Path(settings.STORAGE_DIR).mkdir(parents=True, exist_ok=True)
    init_db()


@app.get('/')
def root():
    return {'message': f'{settings.APP_NAME} online'}
